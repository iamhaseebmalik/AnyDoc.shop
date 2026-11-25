<div align="center">

![AnyDoc — Graphite Studio](public/anydoc-share-image.jpg)

# AnyDoc.shop

### AI-assisted document photo preparation and text review

**Upload a document, extract every text field with AI, review and correct the results, and export a clean, high-resolution copy — all in a private, mobile-ready workspace.**

[Visit AnyDoc](https://anydoc.shop) · [Registration bot](https://t.me/AnyDocBot) · [Bot documentation](TELEGRAM_BOT.md)

</div>

---

## About

AnyDoc is a production web application for careful, authorized document workflows. It combines AI text extraction, private account-bound file handling, Telegram-assisted registration, crypto payments, and a full administrator workspace in one product.

It is built for operators who want to run a paid document-preparation service: customers register through a Telegram bot, pay with crypto, receive sign-in credentials automatically, and work in a private editor. The operator manages packages, prices, payments, and accounts from an admin dashboard — no code changes required.

> **Responsible use:** AnyDoc is not affiliated with any government. Editing does not guarantee acceptance by authorities. Users are responsible for the legality of their actions. Do not use this project to falsify identity documents, impersonate people, or bypass identity checks. For a new product, prioritize authorized processing, redaction, document review, and photo preparation.

## At a glance

| For customers | For operators | For builders |
| --- | --- | --- |
| Sign in, upload, review extracted text, and inspect results | Manage packages, payment approvals, and accounts | Start from a React application with reusable interface elements and server-side functions |
| Phone navigation, editing history, and profile | Telegram-assisted registration and recovery | Customize branding, workflows, integrations, and deployment |

## What is included

- **Graphite Studio interface** — dark graphite surfaces, electric-lime accents, Space Grotesk headings, and Manrope body text.
- **Document workspace** — upload JPG, PNG, or PDF, review individually extracted text fields, and compare outputs with zoom and pan.
- **AI integration** — Gemini 2.5 Flash for text extraction and Gemini 3 Pro Image through an AI gateway. Model availability and usage costs apply.
- **Account experience** — email/password sign-in, Telegram username/password registration, history, profile, and mobile bottom navigation.
- **Admin dashboard** — edit package names, descriptions, and prices; publish or disable packages; review and approve or reject orders; manage account credits, access dates, and blocking.
- **Telegram + Crypto Pay** — private registration conversations, random credentials, payment verification, and account recovery.
- **Private file handling** — account-bound storage, temporary signed URLs, and a cleanup function intended for 24-hour retention.

**Important boundaries:** country templates are illustrative representations, not verified official artwork. AI output requires human review and is not a document-authenticity or compliance guarantee. Package credit and duration fields are stored, but registration purchases do not enforce editing quotas. Automatic payment handling re-fetches invoices from the provider; manual approval depends on the administrator confirming payment independently.

## Try the existing product

1. Open [anydoc.shop](https://anydoc.shop).
2. Sign in with an existing account, or request registration through [@AnyDocBot](https://t.me/AnyDocBot).
3. Review the bot's current packages and complete payment.
4. Use the credentials delivered privately by the bot to sign in.
5. Upload only material you are legally authorized to process and review every result before using it.

Prices are managed by the administrator; the bot is the source of current offers. New accounts are not created through a public signup form.

## Build your own product

### 1. Get your own copy

Clone your copy of the repository using the URL shown by GitHub's **Code** button, then open that folder in a terminal. Use Node.js 20 or newer with npm; Bun is used for the test suite.

```bash
npm ci
npm run dev
```

Use the local address printed by Vite. Starting the interface alone does **not** create a working backend, copy existing accounts, or transfer the original project's service connections.

### 2. Configure your own backend

The quickest workflow is to import your source into a new project with a managed backend and configure your own integrations. If available, the dashboard prompt's **+ → Import project → Upload code** accepts a source ZIP. Import availability varies by account.

For local development, supply your own project's public configuration in a local environment file:

```dotenv
VITE_SUPABASE_URL=<your-own-backend-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-own-public-client-key>
VITE_SUPABASE_PROJECT_ID=<your-own-project-id>
```

These are public client settings, not administrator credentials. Never reuse AnyDoc's production configuration, commit private credentials, or put server secrets in `VITE_` variables. In a managed project, let the platform generate the client configuration rather than editing its generated client files.

### 3. Provision the services

| Service | What your copy needs |
| --- | --- |
| Database and authentication | Your own profiles, roles, document tracking, history, registration tables, metadata view, and access policies |
| Storage | Private buckets, account ownership checks, and signed URL access |
| AI | AI gateway access and sufficient usage credits |
| Telegram | Your own bot connection, permanent numeric administrator ID, and protected webhook configuration |
| Crypto Pay | Your own app connection and payment-notification configuration |
| Retention | A scheduled invocation of the protected cleanup function; verify expired files and records are removed |

Database changes are under `drizzle/migrations/`. **They are incremental changes to an existing application, not a complete fresh-database bootstrap:** the earliest included migration assumes some original tables already exist. Inspect and provision the baseline schema before applying them to an empty database. Generated TypeScript types are not a substitute for schema creation.

Deploy the functions in `supabase/functions/` to your own backend. Configure server-only secrets through your backend's secrets settings, never in source files. Current function code expects `LOVABLE_API_KEY`, `TELEGRAM_API_KEY`, `UDC_CRYPTO_PAY_API_KEY`, and `TELEGRAM_ADMIN_ID`, alongside backend-managed server credentials. The Telegram webhook secret is derived server-side from the bot connection key. Connector keys are for the connector gateway, not direct provider calls.

See [TELEGRAM_BOT.md](TELEGRAM_BOT.md) for command behavior and webhook setup. Use your own endpoint addresses and numeric administrator identity; changing a display username alone does not change authorization.

### 4. Make it yours

| Change | Start here |
| --- | --- |
| Theme, colors, typography | `src/index.css`, `tailwind.config.ts` |
| Sign-in and registration presentation | `src/pages/Auth.tsx` |
| Main workspace | `src/pages/Editor.tsx` and `src/hooks/` |
| Administrator experience | `src/pages/Admin.tsx`, `supabase/functions/admin-api/` |
| Bot and payment workflows | `supabase/functions/_shared/telegramRegistration.ts` |
| Page title, search information, and share image | `index.html`, `src/components/SiteMetadata.tsx`, `public/` |
| Routing and phone navigation | `src/App.tsx`, `src/components/MobileTabBar.tsx` |

Replace the AnyDoc name, domain, bot links, artwork, and administrator configuration with your own. Preserve server-side role checks, private storage, payment verification, and legal disclosures. Admin-set browser metadata does not replace static metadata for crawlers that do not execute JavaScript.

### 5. Test and deploy

```bash
# Unit tests; database permission tests need an isolated test backend
bun test tests/

# Production bundle on your own machine
npm run build
npm run preview
```

Database permission tests run only when `SUPABASE_DB_URL` or `DB_URL` is provided and require `psql`. Without that configuration, those checks are skipped; a passing unit suite is not proof of a deployed payment or account flow.

Deploy the generated `dist/` folder to a static host with a fallback to `index.html` for application paths. Configure your own domain, environment settings, authentication redirects, backend functions, and payment notifications separately.

Before launching, verify a real sign-in, upload/read/delete, AI request, paid registration with credential delivery, administrator package update, and cleanup run in your own environment. Existing AnyDoc payment notification delivery and a real paid registration remain pending end-to-end verification; do not treat the source as a production certification.

## Project map

```text
src/
  pages/                 Sign-in, editor, history, profile, administration
  components/            Shared interface, navigation, and metadata
  hooks/                 Authentication, uploads, OCR, edits, and history
  integrations/          Generated backend client and types
supabase/functions/
  _shared/               Payment rules, bot logic, and AI pause state
  admin-api/             Protected administration operations
  telegram-webhook/      Bot updates
  crypto-pay-webhook/    Payment notifications
  extract-document-text/ AI text extraction
  edit-document/         AI processing
  cleanup-expired-documents/
drizzle/migrations/      Incremental database migrations
tests/                   Business-rule and access checks
public/                  Public branding assets; never private documents
```

## Security and reuse

Keep document buckets private, preserve row-level access controls, never log document contents or passwords, and independently verify payment before manual approval. Treat the 24-hour deletion schedule as an operational requirement that must be monitored, not merely a promise in the interface.

**No license file is currently included.** Access to source code is not by itself permission to redistribute or sell it. Obtain the owner's permission before commercial reuse, and review dependency licenses and third-party service terms. Do not assume AnyDoc branding, template artwork, or production service access is included in any reuse permission.

---

<div align="center">

**AnyDoc.shop** · Designed for careful, authorized document workflows

</div>
