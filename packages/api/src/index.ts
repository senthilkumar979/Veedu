import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseEnv {
  url?: string;
  publishableKey?: string;
}

/**
 * Next.js only inlines NEXT_PUBLIC_* when accessed with a static property path
 * (process.env.NEXT_PUBLIC_FOO). Dynamic process.env[name] is undefined in the
 * browser bundle.
 */
function readPublicSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
}

function readPublicPublishableKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    undefined
  );
}

export function hasSupabaseEnv(env: SupabaseEnv = {}): boolean {
  const url = env.url ?? readPublicSupabaseUrl();
  const key = env.publishableKey ?? readPublicPublishableKey();
  return Boolean(url && key && !url.includes("your-project"));
}

export function createSupabaseClient(
  env: SupabaseEnv = {},
): SupabaseClient | null {
  const url = env.url ?? readPublicSupabaseUrl();
  const key = env.publishableKey ?? readPublicPublishableKey();
  if (!url || !key || url.includes("your-project")) return null;
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

/** Server-only admin client. Never import from client components. */
export function createSupabaseServiceClient(): SupabaseClient | null {
  const url = readPublicSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key || url.includes("your-project")) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** User-scoped client from a Bearer access token (API routes). */
export function createSupabaseUserClient(
  accessToken: string,
): SupabaseClient | null {
  const url = readPublicSupabaseUrl();
  const key = readPublicPublishableKey();
  if (!url || !key) return null;
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
