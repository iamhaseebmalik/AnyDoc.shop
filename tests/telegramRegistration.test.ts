import { describe, expect, it } from "bun:test";
import { generateRegistrationPassword, invoiceMatchesOrder, isTelegramAdmin, telegramLoginEmail } from "../supabase/functions/_shared/registrationRules";

describe("Telegram registration rules", () => {
  it("permits only the designated permanent Telegram admin ID", () => {
    expect(isTelegramAdmin(1230426856, "1230426856")).toBe(true);
    expect(isTelegramAdmin(1230426857, "1230426856")).toBe(false);
    expect(isTelegramAdmin(1230426856, undefined)).toBe(false);
  });
  it("uses a normalized Telegram username for sign-in without email lookup", () => {
    expect(telegramLoginEmail("@AnyDocUser")).toBe("anydocuser@telegram.anydoc.local");
    expect(() => telegramLoginEmail("not a username")).toThrow();
  });
  it("requires a paid invoice matching the order, exact USD price and private payload", () => {
    const order = { id: "order-one", invoice_id: 123, price_usd: "20.00" };
    const invoice = { invoice_id: 123, status: "paid", currency_type: "fiat", fiat: "USD", amount: "20", payload: "order-one" };
    expect(invoiceMatchesOrder(invoice, order)).toBe(true);
    for (const patch of [{ status: "active" }, { amount: "19.99" }, { fiat: "EUR" }, { payload: "other" }, { invoice_id: 124 }]) {
      expect(invoiceMatchesOrder({ ...invoice, ...patch }, order)).toBe(false);
    }
  });
  it("generates a different cryptographically random password for each user", () => {
    const first = generateRegistrationPassword();
    const second = generateRegistrationPassword();
    expect(first).not.toBe(second);
    expect(first.length).toBe(51);
    expect(second.length).toBe(51);
  });
});