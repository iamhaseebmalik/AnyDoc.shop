import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { verifyAndFulfill } from "../_shared/telegramRegistration.ts";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const NotificationSchema = z.object({ update_type: z.literal("invoice_paid"), payload: z.object({ invoice_id: z.number().int().positive() }) });

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const parsed = NotificationSchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Invalid notification" }, 400);
    // This is an untrusted wake-up signal, not payment proof. The connector holds the
    // provider token, so fulfillment ALWAYS fetches the invoice from Crypto Pay and
    // matches its paid status, currency, amount and private order payload. No credentials
    // or order details are ever returned to the caller. Replays cannot grant twice.
    await verifyAndFulfill(parsed.data.payload.invoice_id);
    return json({ ok: true });
  } catch {
    return json({ error: "Payment verification temporarily unavailable" }, 503);
  }
});