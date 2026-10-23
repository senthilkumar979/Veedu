# Deploying Veedu (ops)

## Vercel (web)

1. Import the monorepo; set **Root Directory** to `apps/web` (or use Turborepo / pnpm filter).
2. Build command: `cd ../.. && pnpm install && pnpm --filter @veedu/web build`  
   (adjust if your Vercel root is the repo root.)
3. Output: Next.js default (`.next`).
4. Set environment variables (Production + Preview):

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Publishable / anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | yes for Google OAuth callback + invite accept | **Server only** — never expose to the client |
| `NEXT_PUBLIC_APP_URL` | yes | e.g. `https://veedu.vercel.app` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | for Google sync | Google Cloud OAuth client (web) |
| `GOOGLE_OAUTH_STATE_SECRET` | recommended | Random string for OAuth state HMAC |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | for web push | |
| `GEMINI_API_KEY` | optional | AI modules |

5. In Google Cloud Console → Credentials → OAuth client, add redirect URI:  
   `{NEXT_PUBLIC_APP_URL}/api/google/callback`
6. In Supabase Auth → URL configuration, add the same site URL / redirect allow-list.

## Supabase

1. Apply migrations (`supabase db push` or SQL editor), including Google/invites migration.
2. **Email confirm:** for smoother signup, disable Confirm email or configure SMTP under Auth → Email.
3. **Storage:** bucket policies use path `households/{household_id}/documents/...`. In Storage settings, allow your web origin under CORS if browser uploads fail:

```json
[
  {
    "origin": ["http://localhost:3000", "https://YOUR_DOMAIN"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "headers": ["*"],
    "maxAgeSeconds": 3600
  }
]
```

4. Keep RLS enabled; never ship the service role key to the browser.

## Desktop (Tauri)

See `apps/desktop/README.md`. Sign and notarize macOS builds before distribution. Native shortcut: **⌘⇧V** / **Ctrl+Shift+V**.
