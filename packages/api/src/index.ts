import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseEnv {
  url?: string;
  anonKey?: string;
}

function readEnv(name: string): string | undefined {
  if (typeof process !== "undefined" && process.env?.[name]) return process.env[name];
  return undefined;
}

export function hasSupabaseEnv(env: SupabaseEnv = {}): boolean {
  const url = env.url ?? readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = env.anonKey ?? readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return Boolean(url && key && !url.includes("your-project"));
}

export function createSupabaseClient(
  env: SupabaseEnv = {},
): SupabaseClient | null {
  const url = env.url ?? readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = env.anonKey ?? readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !key || url.includes("your-project")) return null;
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

export * from "./demo-store";
