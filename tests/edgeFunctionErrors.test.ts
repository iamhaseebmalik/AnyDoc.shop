import { describe, expect, it } from "bun:test";
import { readEdgeFunctionFailure } from "../src/lib/edgeFunctionErrors";

describe("readEdgeFunctionFailure", () => {
  it("preserves the AI credit message and status from the function response", async () => {
    const response = new Response(
      JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
      { status: 402, headers: { "Content-Type": "application/json" } },
    );

    const result = await readEdgeFunctionFailure({ context: response }, "Fallback message");

    expect(result.status).toBe(402);
    expect(result.message).toBe("AI usage limit reached. Please add credits to continue.");
  });

  it("uses a safe fallback when the function response has no message", async () => {
    const response = new Response("not-json", { status: 503 });

    const result = await readEdgeFunctionFailure({ context: response }, "Service unavailable.");

    expect(result.status).toBe(503);
    expect(result.message).toBe("Service unavailable.");
  });
});