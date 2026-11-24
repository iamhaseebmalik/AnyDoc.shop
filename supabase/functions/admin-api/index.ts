import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { database, fulfillOrder } from "../_shared/telegramRegistration.ts";

const Code = z.string().regex(/^[a-z0-9-]{2,32}$/);
const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("overview") }),
  z.object({ action: z.literal("savePackage"), code: Code, name: z.string().trim().min(1).max(80),
    description: z.string().trim().max(500), price_usd: z.number().positive().max(10000),
    credits: z.number().int().min(0).max(100000), duration_days: z.number().int().min(0).max(3650), enabled: z.boolean() }),
  z.object({ action: z.literal("approveOrder"), orderId: z.string().uuid() }),
  z.object({ action: z.literal("rejectOrder"), orderId: z.string().uuid() }),
  z.object({ action: z.literal("updateAccess"), userId: z.string().uuid(), credits: z.number().int().min(0).max(100000), expires_at: z.string().datetime().nullable() }),
  z.object({ action: z.literal("setBlocked"), userId: z.string().uuid(), blocked: z.boolean() }),
]);

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json({ error: "Sign in required" }, 401);
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: claims, error: claimsError } = await userClient.auth.getClaims(auth.slice(7));
    if (claimsError || !claims?.claims?.sub) return json({ error: "Sign in required" }, 401);
    const db = database();
    const { data: isAdmin } = await db.rpc("has_role", { _user_id: claims.claims.sub, _role: "admin" });
    if (!isAdmin) return json({ error: "Admin access only" }, 403);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const b = parsed.data;

    if (b.action === "overview") {
      const [packages, orders, accounts, access, profiles] = await Promise.all([
        db.from("registration_packages").select("*").order("price_usd"),
        db.from("registration_orders").select("*").order("created_at", { ascending: false }).limit(200),
        db.from("telegram_accounts").select("*").order("created_at", { ascending: false }),
        db.from("account_entitlements").select("*"),
        db.from("profiles").select("user_id,email,full_name,created_at"),
      ]);
      for (const r of [packages, orders, accounts, access, profiles]) if (r.error) throw r.error;
      const { data: authUsers } = await db.auth.admin.listUsers({ perPage: 1000 });
      const authMap = new Map((authUsers?.users ?? []).map(u => [u.id, u]));
      const accessMap = new Map(access.data!.map(a => [a.user_id, a]));
      const tgMap = new Map(accounts.data!.map(a => [a.user_id, a]));
      const users = profiles.data!.map(p => {
        const u = authMap.get(p.user_id);
        return { user_id: p.user_id, email: p.email, name: p.full_name, telegram: tgMap.get(p.user_id)?.username ?? null,
          created_at: p.created_at, last_sign_in: u?.last_sign_in_at ?? null,
          blocked: !!(u?.banned_until && new Date(u.banned_until) > new Date()),
          credits: accessMap.get(p.user_id)?.credits ?? 0, expires_at: accessMap.get(p.user_id)?.expires_at ?? null };
      });
      const tgByTid = new Map(accounts.data!.map(a => [a.telegram_user_id, a.username]));
      return json({ packages: packages.data, orders: orders.data!.map(o => ({ ...o, telegram_username: tgByTid.get(o.telegram_user_id) ?? null })), users });
    }
    if (b.action === "savePackage") {
      const { action: _a, ...row } = b;
      const { error } = await db.from("registration_packages").upsert({ ...row, updated_at: new Date().toISOString() });
      if (error) throw error;
      return json({ ok: true });
    }
    if (b.action === "approveOrder") {
      const { data: o } = await db.from("registration_orders").select("status,fulfilled_at").eq("id", b.orderId).maybeSingle();
      if (!o) return json({ error: "Order not found" }, 404);
      if (o.status === "rejected") return json({ error: "Order was rejected" }, 409);
      const ok = await fulfillOrder(b.orderId);
      return ok ? json({ ok: true }) : json({ error: "Order is being processed, try again shortly" }, 409);
    }
    if (b.action === "rejectOrder") {
      const { error } = await db.from("registration_orders").update({ status: "rejected", processing_until: null }).eq("id", b.orderId).is("fulfilled_at", null);
      if (error) throw error;
      return json({ ok: true });
    }
    if (b.action === "updateAccess") {
      const { error } = await db.from("account_entitlements").upsert({ user_id: b.userId, credits: b.credits, expires_at: b.expires_at, updated_at: new Date().toISOString() });
      if (error) throw error;
      return json({ ok: true });
    }
    if (b.action === "setBlocked") {
      if (b.userId === claims.claims.sub) return json({ error: "You can't block yourself" }, 400);
      const { error } = await db.auth.admin.updateUserById(b.userId, { ban_duration: b.blocked ? "876000h" : "none" });
      if (error) throw error;
      return json({ ok: true });
    }
    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("admin-api failed", e instanceof Error ? e.message : e);
    return json({ error: "Something went wrong" }, 500);
  }
});
