# Veedu

Household command center — one place for the home’s shared plans, tasks, and day-to-day coordination.

**Brand:** Veedu · **Primary:** `#5046C7` · **Stack:** Next.js App Router, Tailwind + CSS tokens, Supabase, TanStack Query, RHF + Zod, pnpm monorepo, PWA, Tauri desktop shell, optional AI modules.

## Product spec

See [household-command-center-product-spec.pdf](./household-command-center-product-spec.pdf) for the full product specification.

## Monorepo layout

```
apps/web          Next.js (App Router) + PWA
apps/desktop      Tauri 2 shell (loads shared web UI)
packages/ui       Design tokens + primitives
packages/domain   Zod schemas + business helpers
packages/types    Shared TypeScript types
packages/api      Supabase client + demo data store
packages/config   Shared TS/Tailwind config
supabase/migrations  SQL schema + RLS
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

- If `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set, the app uses the real Supabase client.
- If absent, the same hooks serve an in-memory **demo store** with seed data so UI, validation, and flows work locally.

Apply SQL from `supabase/migrations/` in your Supabase project (tables + RLS + storage policies).

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
| `/settings` | Household settings |
| `/ai/assistant` | Household Assistant (stub LLM) |
| `/ai/tech-radar` | Personal Tech Radar |
| `/ai/content` | Content Generator |
| `/login`, `/onboarding` | Auth + short onboarding |
| `/more` | Mobile “More” hub |

Cross-cutting: command palette (`⌘/Ctrl+K`), global search stub, notification center, PWA manifest + service worker.

## Desktop (Tauri)

See [apps/desktop/README.md](./apps/desktop/README.md). Prefer loading the shared web app; native tray/shortcut/notifications are scaffolded/documented for follow-up.

## Security notes

- RLS enforces household membership; shared vs private visibility.
- Documents storage path: `households/{household_id}/documents/{document_id}/`.
- **Never** store passwords, PINs, CVVs, OTPs, or recovery codes in Accounts.
