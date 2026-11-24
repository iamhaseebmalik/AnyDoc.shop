export function normalizeTelegramUsername(value: string): string {
  const username = value.trim().replace(/^@/, "").toLowerCase();
  if (!/^[a-z][a-z0-9_]{4,31}$/.test(username)) {
    throw new Error("Enter a valid Telegram username (5–32 letters, numbers or underscores).");
  }
  return username;
}

export function telegramLoginEmail(value: string): string {
  return `${normalizeTelegramUsername(value)}@telegram.anydoc.local`;
}

export function isTelegramAdmin(userId: number, configuredId: string | undefined): boolean {
  return Boolean(configuredId && /^[1-9]\d+$/.test(configuredId) && String(userId) === configuredId);
}

export function usdCents(value: string): number {
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(value)) throw new Error("Use a USD price with at most two decimal places.");
  const [whole, fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

export interface VerifiedInvoice {
  invoice_id: number;
  status: string;
  currency_type: string;
  fiat?: string;
  amount: string;
  payload?: string;
}

export function invoiceMatchesOrder(invoice: VerifiedInvoice, order: { id: string; invoice_id: number; price_usd: string | number }): boolean {
  try {
    return invoice.status === "paid" && invoice.invoice_id === order.invoice_id &&
      invoice.currency_type === "fiat" && invoice.fiat === "USD" && invoice.payload === order.id &&
      usdCents(invoice.amount) === usdCents(String(order.price_usd));
  } catch {
    return false;
  }
}

export function generateRegistrationPassword(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return `Ad!${Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("")}`;
}