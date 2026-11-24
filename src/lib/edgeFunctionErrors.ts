export interface EdgeFunctionFailure {
  message: string;
  status: number | null;
}

export const readEdgeFunctionFailure = async (
  error: unknown,
  fallbackMessage: string,
): Promise<EdgeFunctionFailure> => {
  if (typeof error !== "object" || error === null) {
    return { message: fallbackMessage, status: null };
  }

  const context = "context" in error ? error.context : null;
  if (!(context instanceof Response)) {
    return { message: fallbackMessage, status: null };
  }

  try {
    const payload: unknown = await context.clone().json();
    if (typeof payload === "object" && payload !== null) {
      if ("error" in payload && typeof payload.error === "string" && payload.error.trim()) {
        return { message: payload.error, status: context.status };
      }
      if ("message" in payload && typeof payload.message === "string" && payload.message.trim()) {
        return { message: payload.message, status: context.status };
      }
    }
  } catch {
    // Keep the user-facing fallback when the function response is not JSON.
  }

  return { message: fallbackMessage, status: context.status };
};