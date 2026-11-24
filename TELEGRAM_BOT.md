# AnyDoc Telegram registration

## Administrator

Open @AnyDocBot and send `/admin` from the configured administrator's Telegram account. Authorization uses the permanent numeric Telegram ID saved in the server configuration, never a username supplied in a message.

Commands:

- `/package CODE USD_PRICE NAME` — create or update a registration package and publish it.
- `/setprice CODE USD_PRICE` — change an existing price.
- `/disable CODE` — stop selling a package.
- `/title TEXT` — update the browser title.
- `/description TEXT` — update the browser description.

Prices are set by the administrator; no registration price is pre-published. These packages sell account registration, not enforced editing quotas. Existing editing functionality is unchanged.

## Crypto Pay setup

The Crypto Pay connection is linked. In Lovable Cloud, open the `crypto-pay-webhook` function and copy its endpoint address. In @CryptoBot, open Crypto Pay → My Apps → your app → Webhooks and enable that address. This provider setup cannot be completed through the Crypto Pay API.

Payment notifications are treated as untrusted signals. The server retrieves the invoice through the Crypto Pay connector and verifies paid status, exact USD amount, invoice ID, and order payload before account issuance. Duplicate callbacks do not grant the same order twice. `/status` also verifies payments through the provider when notifications have not arrived.

## Users

- `/start` — registration menu.
- `/packages` or `/price` — current registration prices.
- Package buttons or `/buy CODE` — request a crypto invoice.
- `/status` — verify recent payments.
- `/reset` — generate a new password for the account linked to the private Telegram sender.

Users must set a Telegram username before purchasing. The first registration reserves the normalized username as the website sign-in handle. A later Telegram username change does not transfer account ownership or change that original handle. Recovery is tied to the permanent Telegram ID, not the current username.

Passwords are generated server-side using cryptographic randomness and sent only in private Telegram chats with content protection. No plaintext password is stored in application tables or logs. Telegram is not an end-to-end encrypted password vault; users should keep their Telegram account secure.

Existing accounts retain email/password sign-in. New bot accounts use a deterministic synthetic email internally, with public signup disabled. No confirmation email is sent to the synthetic address. Email-based recovery is unavailable for these accounts.

## Metadata and verification limits

Metadata changes appear after website load or window focus. They do not rewrite static hosting metadata seen by crawlers that do not run JavaScript.

Verified: provider connections, Telegram message delivery configuration, a handled incoming Telegram update, unsigned update rejection, invalid invoice rejection, payment-matching rules, random-password rules, and sign-in input routing at phone and desktop sizes.

Pending: an administrator-published price, Crypto Pay notification setup, a real paid invoice, credential delivery, and real username/password sign-in. No real purchase has been made or simulated as paid.