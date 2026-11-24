import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { generateRegistrationPassword, invoiceMatchesOrder, isTelegramAdmin, normalizeTelegramUsername, telegramLoginEmail, usdCents } from "./registrationRules.ts";

function env(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export function database() {
  return createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false, autoRefreshToken: false } });
}

async function gateway(connector: "telegram" | "udc_crypto_pay", method: string, body: Record<string, unknown>) {
  const key = connector === "telegram" ? "TELEGRAM_API_KEY" : "UDC_CRYPTO_PAY_API_KEY";
  const path = connector === "telegram" ? method : `api/${method}`;
  const response = await fetch(`https://connector-gateway.lovable.dev/${connector}/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env("LOVABLE_API_KEY")}`, "X-Connection-Api-Key": env(key), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const details = await response.text();
    // Never log outgoing messages, which may contain credentials.
    console.error(`${connector} failed [${response.status}]: ${details}`);
    throw new Error(`Provider request failed [${response.status}]: ${details}`);
  }
  const data = await response.json();
  if (!data.ok) {
    const details = JSON.stringify(data.error ?? data.description ?? "Unknown provider failure");
    console.error(`${connector} failed [${data.error_code ?? 400}]: ${details}`);
    throw new Error(`Provider request failed [${data.error_code ?? 400}]: ${details}`);
  }
  return data.result;
}

export async function send(chatId: number, text: string, keyboard?: unknown) {
  return gateway("telegram", "sendMessage", { chat_id: chatId, text, ...(keyboard ? { reply_markup: keyboard } : {}), protect_content: true });
}

const InvoiceSchema = z.object({
  invoice_id: z.number().int().positive(), status: z.string(), amount: z.string(),
  currency_type: z.string(), fiat: z.string().optional(), payload: z.string().optional(),
});

export async function verifyAndFulfill(invoiceId: number): Promise<boolean> {
  const db = database();
  const { data: order, error: orderError } = await db.from("registration_orders").select("*").eq("invoice_id", invoiceId).maybeSingle();
  if (orderError) throw orderError;
  if (!order) return false;
  if (order.fulfilled_at) return true;
  const result = await gateway("udc_crypto_pay", "getInvoices", { invoice_ids: String(invoiceId), count: 1 });
  const invoices = z.object({ items: z.array(InvoiceSchema) }).parse(result);
  const invoice = invoices.items[0];
  if (!invoice || !invoiceMatchesOrder(invoice, order)) return false;
  return fulfillOrder(order.id);
}

// Issues credentials and grants the package. Callers must have already confirmed payment
// (provider-verified invoice, or an authenticated admin's manual approval).
export async function fulfillOrder(orderId: string): Promise<boolean> {
  const db = database();
  const { data: order, error: orderError } = await db.from("registration_orders").select("*").eq("id", orderId).maybeSingle();
  if (orderError) throw orderError;
  if (!order) return false;
  if (order.fulfilled_at) return true;
  const now = new Date().toISOString();
  const { data: claimed, error: claimError } = await db.from("registration_orders")
    .update({ status: "processing", processing_until: new Date(Date.now() + 120_000).toISOString() })
    .eq("id", order.id).is("fulfilled_at", null)
    .or(`processing_until.is.null,processing_until.lt.${now}`).select("id").maybeSingle();
  if (claimError) throw claimError;
  if (!claimed) return false;
  try {
    const { data: account, error: accountError } = await db.from("telegram_accounts").select("*").eq("telegram_user_id", order.telegram_user_id).single();
    if (accountError) throw accountError;
    const existing = await db.auth.admin.getUserById(account.user_id);
    let password: string | undefined;
    if (!existing.data.user) {
      password = generateRegistrationPassword();
      const { error } = await db.auth.admin.createUser({
        id: account.user_id, email: telegramLoginEmail(account.username), password, email_confirm: true,
        user_metadata: { full_name: `@${account.username}` },
      });
      if (error) throw error;
    }
    const { error: profileError } = await db.from("profiles").update({ telegram_user_id: account.telegram_user_id, telegram_username: account.username }).eq("user_id", account.user_id);
    if (profileError) throw profileError;
    await send(account.telegram_user_id, password
      ? `Payment confirmed. Your AnyDoc account is ready.\n\nUsername: ${account.username}\nPassword: ${password}\n\nSign in: https://anydoc.shop\nKeep this password private. Use /reset in this private chat to get a new password.`
      : `Payment confirmed. Your package is registered.\nUsername: ${account.username}\nSign in: https://anydoc.shop\nIf you need a new password, use /reset.`);
    const { error } = await db.rpc("complete_registration_order", { order_id: order.id });
    if (error) throw error;
    return true;
  } catch (error) {
    await db.from("registration_orders").update({ status: "pending", processing_until: null }).eq("id", order.id).is("fulfilled_at", null);
    throw error;
  }
}

export const TelegramUpdateSchema = z.object({
  update_id: z.number().int().nonnegative(),
  message: z.object({
    text: z.string().max(4096).optional(),
    from: z.object({ id: z.number().int().positive(), username: z.string().max(32).optional() }).optional(),
    chat: z.object({ id: z.number().int(), type: z.string() }),
  }).optional(),
  callback_query: z.object({ id: z.string().max(256), data: z.string().max(64).optional(),
    from: z.object({ id: z.number().int().positive(), username: z.string().max(32).optional() }),
    message: z.object({ chat: z.object({ id: z.number().int(), type: z.string() }) }).optional(),
  }).optional(),
});

const menu = { inline_keyboard: [[{ text: "Prices & packages", callback_data: "/packages" }], [{ text: "Payment status", callback_data: "/status" }], [{ text: "Sign in", url: "https://anydoc.shop" }]] };
const adminHelp = "Admin controls\n/packages — list packages\n/package CODE USD_PRICE NAME — add or update a registration package\n/setprice CODE USD_PRICE — change price\n/disable CODE — stop selling a package\n/title TEXT — website browser title\n/description TEXT — website description\nExample: /package registration 5.00 Account registration\nPrices are USD. Packages grant website registration; editing quotas are not changed by these commands.";

export async function handleTelegramUpdate(update: z.infer<typeof TelegramUpdateSchema>) {
  const actor = update.callback_query?.from ?? update.message?.from;
  const chat = update.callback_query?.message?.chat ?? update.message?.chat;
  if (!actor || !chat || chat.type !== "private" || chat.id !== actor.id) return;
  const text = (update.callback_query?.data ?? update.message?.text ?? "").trim();
  if (update.callback_query) await gateway("telegram", "answerCallbackQuery", { callback_query_id: update.callback_query.id });
  const db = database();
  const [rawCommand, ...args] = text.split(/\s+/);
  const command = rawCommand.split("@")[0].toLowerCase();
  const admin = isTelegramAdmin(actor.id, Deno.env.get("TELEGRAM_ADMIN_ID"));

  if (["/admin", "/package", "/setprice", "/disable", "/title", "/description"].includes(command)) {
    if (!admin) { await send(chat.id, "Admin access is not available for this Telegram account."); return; }
    if (command === "/admin") { await send(chat.id, adminHelp); return; }
    if (command === "/title" || command === "/description") {
      const value = z.string().trim().min(1).max(command === "/title" ? 100 : 300).parse(args.join(" "));
      const { error } = await db.from("website_settings").upsert({ id: true, [command.slice(1)]: value, updated_at: new Date().toISOString() });
      if (error) throw error;
      await send(chat.id, "Website metadata updated."); return;
    }
    const code = z.string().regex(/^[a-z][a-z0-9_-]{0,23}$/).parse(args[0]);
    if (command === "/disable") {
      const { data, error } = await db.from("registration_packages").update({ enabled: false }).eq("code", code).select("code").maybeSingle();
      if (error) throw error;
      await send(chat.id, data ? "Package disabled." : "Package not found."); return;
    }
    const cents = usdCents(args[1] ?? "");
    if (cents < 100 || cents > 1_000_000) { await send(chat.id, "Registration prices must be between $1.00 and $10,000.00 USD."); return; }
    const price = (cents / 100).toFixed(2);
    if (command === "/package") {
      const name = z.string().trim().min(1).max(100).parse(args.slice(2).join(" "));
      const { error } = await db.from("registration_packages").upsert({ code, name, price_usd: price, enabled: true, updated_at: new Date().toISOString() });
      if (error) throw error;
    } else {
      const { data, error } = await db.from("registration_packages").update({ price_usd: price, updated_at: new Date().toISOString() }).eq("code", code).select("code").maybeSingle();
      if (error) throw error;
      if (!data) { await send(chat.id, "Package not found. Use /package to create one."); return; }
    }
    await send(chat.id, `Package ${code} price saved: $${price} USD.`); return;
  }

  if (command === "/start" || command === "/help" || !text) {
    await send(chat.id, `Welcome to AnyDoc.\nView registration packages, pay with crypto, and receive your sign-in credentials here.\nAccount recovery is available only through this Telegram account.\nAnyDoc is not government affiliated. You are responsible for lawful use.${admin ? "\nYou are the administrator. Use /admin to manage packages and metadata." : ""}`, menu); return;
  }
  if (command === "/packages" || command === "/price") {
    const { data, error } = await db.from("registration_packages").select("code,name,description,price_usd").eq("enabled", true).order("price_usd");
    if (error) throw error;
    if (!data?.length) { await send(chat.id, admin ? "No packages available yet. Use /admin to set your first price." : "Registration prices are not available yet. Please check back shortly."); return; }
    await send(chat.id, data.map(p => `${p.name} — $${Number(p.price_usd).toFixed(2)} USD${p.description ? `\n${p.description}` : ""}`).join("\n\n"), { inline_keyboard: data.map(p => [{ text: `${p.name} · $${Number(p.price_usd).toFixed(2)}`, callback_data: `/buy ${p.code}` }]) }); return;
  }

  if (command === "/buy") {
    if (!actor.username) { await send(chat.id, "Set a Telegram username in Telegram Settings before registering."); return; }
    const username = normalizeTelegramUsername(actor.username);
    const code = z.string().regex(/^[a-z][a-z0-9_-]{0,23}$/).parse(args[0]);
    const { data: pkg, error: pkgError } = await db.from("registration_packages").select("*").eq("code", code).eq("enabled", true).maybeSingle();
    if (pkgError) throw pkgError;
    if (!pkg) { await send(chat.id, "This package is not available. Use /packages."); return; }
    let { data: account, error: accountError } = await db.from("telegram_accounts").select("*").eq("telegram_user_id", actor.id).maybeSingle();
    if (accountError) throw accountError;
    if (!account) {
      const result = await db.from("telegram_accounts").insert({ telegram_user_id: actor.id, username }).select("*").single();
      if (result.error?.code === "23505") { await send(chat.id, "This username is already registered. Contact @Anonymousdxb for help."); return; }
      if (result.error) throw result.error;
      account = result.data;
    }
    // A username remains the login handle assigned on first registration; permanent ID controls recovery.
    const { data: pending, error: pendingError } = await db.from("registration_orders").select("*").eq("telegram_user_id", actor.id).eq("package_code", code).eq("status", "pending").gt("created_at", new Date(Date.now() - 3_600_000).toISOString()).not("invoice_url", "is", null).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (pendingError) throw pendingError;
    if (pending?.invoice_url) { await send(chat.id, "Your payment invoice is ready.", { inline_keyboard: [[{ text: "Pay with crypto", url: pending.invoice_url }], [{ text: "Check payment", callback_data: "/status" }]] }); return; }
    const { data: order, error } = await db.from("registration_orders").insert({ telegram_user_id: actor.id, package_code: code, price_usd: pkg.price_usd, credits: pkg.credits, duration_days: pkg.duration_days }).select("*").single();
    if (error) throw error;
    const invoice = z.object({ invoice_id: z.number().int().positive(), bot_invoice_url: z.string().url() }).parse(await gateway("udc_crypto_pay", "createInvoice", {
      currency_type: "fiat", fiat: "USD", amount: Number(pkg.price_usd).toFixed(2), description: `AnyDoc — ${pkg.name}`,
      payload: order.id, expires_in: 3600, allow_comments: false, allow_anonymous: false,
    }));
    const { error: saveError } = await db.from("registration_orders").update({ invoice_id: invoice.invoice_id, invoice_url: invoice.bot_invoice_url }).eq("id", order.id);
    if (saveError) throw saveError;
    await send(chat.id, `${pkg.name}\n$${Number(pkg.price_usd).toFixed(2)} USD\nSign-in username: ${account.username}\nPay using the invoice below. Credentials are issued only after verified payment.`, { inline_keyboard: [[{ text: "Pay with crypto", url: invoice.bot_invoice_url }], [{ text: "Check payment", callback_data: "/status" }]] }); return;
  }
  if (command === "/status") {
    const { data: orders, error } = await db.from("registration_orders").select("invoice_id,status").eq("telegram_user_id", actor.id).order("created_at", { ascending: false }).limit(5);
    if (error) throw error;
    if (!orders?.length) { await send(chat.id, "No registration orders yet. Use /packages."); return; }
    let paid = false;
    for (const order of orders) if (order.invoice_id) paid = await verifyAndFulfill(order.invoice_id) || paid;
    await send(chat.id, paid ? "Payment confirmed. Sign in at https://anydoc.shop. Use /reset if you need a new password." : "Payment is not confirmed yet. Complete your invoice and check again."); return;
  }
  if (command === "/reset") {
    const { data: account, error } = await db.from("telegram_accounts").select("user_id,username").eq("telegram_user_id", actor.id).maybeSingle();
    if (error) throw error;
    if (!account) { await send(chat.id, "No registered account is linked to your Telegram account."); return; }
    const existing = await db.auth.admin.getUserById(account.user_id);
    if (!existing.data.user) { await send(chat.id, "Complete payment first, then check /status."); return; }
    const password = generateRegistrationPassword();
    const { error: resetError } = await db.auth.admin.updateUserById(account.user_id, { password });
    if (resetError) throw resetError;
    await send(chat.id, `Your new AnyDoc password\nUsername: ${account.username}\nPassword: ${password}\nSign in: https://anydoc.shop\nKeep this password private.`); return;
  }
  await send(chat.id, "Use /packages to view prices, /status to check payment, or /reset for account recovery.", menu);
}

export async function telegramWebhookSecret(): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`telegram-webhook:${env("TELEGRAM_API_KEY")}`));
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function safeEqual(actual: string | null, expected: string): boolean {
  if (!actual || actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}