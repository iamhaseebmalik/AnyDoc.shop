import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AiGatewayPause {
  status: 402 | 403;
  message: string;
}

export const readAiGatewayFailure = async (
  response: Response,
  fallbackMessage: string,
): Promise<string> => {
  try {
    const payload: unknown = await response.clone().json();
    if (typeof payload === "object" && payload !== null) {
      if ("message" in payload && typeof payload.message === "string" && payload.message.trim()) {
        return payload.message.slice(0, 500);
      }
      if ("error" in payload) {
        const gatewayError = payload.error;
        if (typeof gatewayError === "string" && gatewayError.trim()) {
          return gatewayError.slice(0, 500);
        }
        if (
          typeof gatewayError === "object" &&
          gatewayError !== null &&
          "message" in gatewayError &&
          typeof gatewayError.message === "string" &&
          gatewayError.message.trim()
        ) {
          return gatewayError.message.slice(0, 500);
        }
      }
    }
  } catch {
    // Use the endpoint-specific safe fallback for non-JSON responses.
  }

  return fallbackMessage;
};

const createServiceClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("AI availability status is unavailable");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

export const getAiGatewayPause = async (): Promise<AiGatewayPause | null> => {
  const { data, error } = await createServiceClient()
    .from("ai_gateway_control")
    .select("paused, http_status, safe_message")
    .eq("state_key", "global")
    .maybeSingle();

  if (error) {
    throw new Error("AI availability status is unavailable");
  }

  if (!data?.paused) return null;

  return {
    status: data.http_status === 403 ? 403 : 402,
    message: data.safe_message || "AI requests are paused until service access is restored.",
  };
};

export const pauseAiGateway = async (status: 402 | 403, message: string): Promise<void> => {
  const { error } = await createServiceClient()
    .from("ai_gateway_control")
    .upsert(
      {
        state_key: "global",
        paused: true,
        http_status: status,
        safe_message: message.slice(0, 500),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "state_key" },
    );

  if (error) {
    throw new Error("AI availability status could not be saved");
  }
};

export const clearAiGatewayPause = async (): Promise<void> => {
  const { error } = await createServiceClient()
    .from("ai_gateway_control")
    .upsert(
      {
        state_key: "global",
        paused: false,
        http_status: null,
        safe_message: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "state_key" },
    );

  if (error) {
    throw new Error("AI availability status could not be updated");
  }
};