import { createSupabaseClient, DEMO_USER_ID, hasSupabaseEnv } from "@veedu/api";

export interface RequestUser {
  id: string;
  mode: "demo" | "supabase";
}

/**
 * Resolve the caller for push API routes.
 * Demo mode (no Supabase env): accepts demo user id from header or defaults.
 * Live mode: requires Bearer access token from Supabase Auth.
 */
export async function resolveRequestUser(
  request: Request,
): Promise<RequestUser | null> {
  if (!hasSupabaseEnv()) {
    const demoHeader = request.headers.get("x-veedu-demo-user");
    return { id: demoHeader || DEMO_USER_ID, mode: "demo" };
  }

  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  const client = createSupabaseClient();
  if (!client) return null;

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id, mode: "supabase" };
}
