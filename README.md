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
packages/api      Supabase client + demo data store
packages/config   Shared TS/Tailwind config
supabase/migrations  SQL schema + RLS (incl. push_subscriptions)
```

## Quick start

```bash
pnpm install
cp .env.example apps/web/.env.local   # optional — without Supabase keys, demo mode is used
pnpm --filter @veedu/web dev
```

Open [http://localhost:3000](http://localhost:3000) and choose **Continue with demo household** (or sign in).

### Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start web app |
| `pnpm build` | Production build (`apps/web`) |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript across packages |
| `pnpm desktop:dev` | Tauri desktop (requires Rust + webview) |

## Environment

See [.env.example](./.env.example).

- If `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set, the app uses the real Supabase client (Auth + persistence).
- If absent, the same hooks serve an in-memory **demo store** (including an in-memory push subscription store).
- Apply SQL from `supabase/migrations/` in your Supabase project (tables + RLS + storage + `push_subscriptions`).

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

Service worker (`apps/web/public/sw.js`) handles `push` + `notificationclick`. Settings → Notifications can enable/disable and send a test. Quiet hours **22:00–07:00** are respected best-effort on send-test (pass `{ force: true }` to override). Live persistence uses `push_subscriptions` + RLS; demo mode keeps subscriptions in memory.

### AI (Gemini)

Set `GEMINI_API_KEY` for live Household Assistant, Tech Radar, and Content Generator. Without the key, modules stay in stub mode. Optional: `GEMINI_MODEL` (default `gemini-2.0-flash`).

### Planned (not implemented)

Google Calendar and Google Contacts — planned later; not wired in this repo yet.

## Major routes

| Route | Feature |
|---|---|
| `/` | Dashboard (attention, weather, today, tasks, payments, documents) |
| `/tasks` | Tasks with filters + CRUD |
| `/calendar` | Agenda / Week / Month |
| `/important-dates` | Categories + CRUD |
| `/bills` | Bills + monthly summary |
| `/subscriptions` | Subscriptions + renewing soon |
| `/documents`, `/documents/[id]` | Vault + viewer |
| `/accounts` | Reference accounts (no secrets) |
| `/contacts` | Contact directory |
| `/places` | Saved places |
| `/home` | Inventory + maintenance |
| `/settings` | Household settings + web push |
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
