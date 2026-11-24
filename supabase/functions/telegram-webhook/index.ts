import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { database, handleTelegramUpdate, safeEqual, send, TelegramUpdateSchema, telegramWebhookSecret } from "../_shared/telegramRegistration.ts";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    if (!safeEqual(req.headers.get("X-Telegram-Bot-Api-Secret-Token"), await telegramWebhookSecret())) return json({ error: "Unauthorized" }, 401);
    const parsed = TelegramUpdateSchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Invalid Telegram update" }, 400);
    const update = parsed.data;
    const db = database();
    const { error: insertError } = await db.from("telegram_update_receipts").insert({ update_id: update.update_id });
    if (insertError && insertError.code !== "23505") throw insertError;
    const { data: claimed, error } = await db.from("telegram_update_receipts").update({ processing_until: new Date(Date.now() + 120_000).toISOString() })
      .eq("update_id", update.update_id).is("completed_at", null)
      .or(`processing_until.is.null,processing_until.lt.${new Date().toISOString()}`).select("update_id").maybeSingle();
    if (error) throw error;
    if (!claimed) return json({ ok: true });
    try {
      await handleTelegramUpdate(update);
      const { error: doneError } = await db.from("telegram_update_receipts").update({ completed_at: new Date().toISOString(), processing_until: null }).eq("update_id", update.update_id);
      if (doneError) throw doneError;
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        const actor = update.callback_query?.from ?? update.message?.from;
        const chat = update.callback_query?.message?.chat ?? update.message?.chat;
        if (actor && chat?.type === "private" && chat.id === actor.id) await send(chat.id, "Invalid command format. Use /help or /admin for valid commands.");
        await db.from("telegram_update_receipts").update({ completed_at: new Date().toISOString(), processing_until: null }).eq("update_id", update.update_id);
        return json({ ok: true });
      }
      await db.from("telegram_update_receipts").update({ processing_until: null }).eq("update_id", update.update_id);
      throw error;
    }
    return json({ ok: true });
  } catch {
    // Do not expose or log Telegram update bodies or generated credentials.
    return json({ error: "Telegram registration is temporarily unavailable. Retry shortly." }, 503);
  }
});