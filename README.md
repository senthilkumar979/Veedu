# Veedu

Household command center — one place for the home’s shared plans, tasks, and day-to-day coordination.

**Brand:** Veedu · **Primary:** `#5046C7` · **Stack:** Next.js App Router, Tailwind + CSS tokens, Supabase Auth, TanStack Query, RHF + Zod, pnpm monorepo, PWA, Tauri desktop shell, optional Gemini AI.

## Product spec

See [household-command-center-product-spec.pdf](./household-command-center-product-spec.pdf) for the full product specification.

## Monorepo layout

```
apps/web          Next.js (App Router) + PWA + API routes
apps/desktop      Tauri 2 shell (loads shared web UI)
packages/ui       Design tokens + primitives
packages/domain   Zod schemas + business helpers
packages/types    Shared TypeScript types
packages/api      Supabase client helpers
packages/config   Shared TS/Tailwind config
supabase/migrations  SQL schema + RLS (incl. push_subscriptions)
```

## Quick start

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local   # fill in Supabase keys (required)
pnpm --filter @veedu/web dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Required:** `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Without them, login/signup are disabled.
- **Email confirm:** for local/dev smoke tests, keep `auth.email.enable_confirmations = false` in `supabase/config.toml` and run `supabase config push` (or turn off Confirm email in the Dashboard). Otherwise signup returns no session until the email link is clicked.
- **Smoke path:** Create account → finish onboarding → add a task → refresh (row should persist) → Settings shows Live Supabase.

### Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start web app |
| `pnpm build` | Production build (`apps/web`) |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript across packages |
| `pnpm desktop:dev` | Tauri desktop (requires Rust + webview) |

## Environment

See [apps/web/.env.example](./apps/web/.env.example).

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are required. Legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` is still accepted as a fallback.
- Apply SQL from `supabase/migrations/` in your Supabase project (tables + RLS + storage + `push_subscriptions`), in filename order. Create a dedicated Veedu project in the Supabase Dashboard, then run migrations via the SQL editor or `supabase db push` after linking.

### Weather (Open-Meteo)

No API key. Dashboard home + parents weather uses place-name strings from onboarding/settings (`home_location` / `parents_location`).

**Geocoding behavior:** city/place strings are resolved via the [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) (first match). Coordinates then hit the forecast API. Missing or unresolvable places show a graceful empty state.

### Web Push (VAPID)

```bash
npx web-push generate-vapid-keys
```

Set:

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (e.g. `mailto:you@example.com`)

Service worker (`apps/web/public/sw.js`) handles `push` + `notificationclick`. Settings → Notifications can enable/disable and send a test. Quiet hours **22:00–07:00** are respected best-effort on send-test (pass `{ force: true }` to override). Persistence uses `push_subscriptions` + RLS.

### AI (Gemini)

Set `GEMINI_API_KEY` for live Household Assistant, Tech Radar, and Content Generator. Without the key, modules stay in stub mode. Optional: `GEMINI_MODEL` (default `gemini-2.0-flash`).

### Google Calendar & Contacts

1. Create a Google Cloud OAuth **Web** client; enable Calendar API + People API.
2. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, and `NEXT_PUBLIC_APP_URL`.
3. Redirect URI: `{NEXT_PUBLIC_APP_URL}/api/google/callback`
4. In Settings → Integrations, **Connect Google**, then **Sync now** (imports as private rows).

### Ops

See [docs/DEPLOY.md](./docs/DEPLOY.md) for Vercel env, Supabase SMTP/CORS, and production checklist.

## Major routes

| Route | Feature |
|---|---|
| `/` | Dashboard (attention, weather, today, tasks, payments, documents) |
| `/tasks` | Tasks with filters + CRUD |
| `/calendar` | Agenda / Week / Month |
| `/important-dates` | Categories + CRUD |
| `/payments` | Upcoming/overdue payments · mark paid rolls due |
| `/due-dates` | Unified renewals, expiries, payment deadlines |
| `/bills` | Bills + monthly summary · optional document link |
| `/subscriptions` | Subscriptions + renewing soon |
| `/documents`, `/documents/[id]` | Vault + viewer |
| `/activity` | Document activity log |
| `/family` | Family members + invites |
| `/accounts` | Reference accounts (no secrets) |
| `/contacts` | Contact directory |
| `/places` | Saved places |
| `/home` | Inventory + maintenance |
| `/settings` | Household, invites, Google sync, web push |
| `/invite/[token]` | Accept household invite |
| `/ai/assistant` | Household Assistant (Gemini or stub) |
| `/ai/tech-radar` | Personal Tech Radar |
| `/ai/content` | Content Generator |
| `/login`, `/onboarding` | Auth + short onboarding |
| `/more` | Mobile “More” hub |

API: `/api/weather`, `/api/push/*`, `/api/ai/*`.

Cross-cutting: command palette (`⌘/Ctrl+K`), global search stub, notification center, PWA manifest + service worker.

## Desktop (Tauri)

See [apps/desktop/README.md](./apps/desktop/README.md). Prefer loading the shared web app; native tray/shortcut/notifications are scaffolded/documented for follow-up.

## Security notes

- Auth is **Supabase Auth only** (no Firebase Auth / FCM).
- RLS enforces household membership; shared vs private visibility; push rows owned by `auth.uid()`.
- Documents storage path: `households/{household_id}/documents/{document_id}/`.
- **Never** store passwords, PINs, CVVs, OTPs, or recovery codes in Accounts.
