import { createSupabaseClient, hasSupabaseEnv } from "@veedu/api";

export interface RequestUser {
  id: string;
}

/**
 * Resolve the caller for push API routes.
 * Requires a Bearer access token from Supabase Auth.
 */
export async function resolveRequestUser(
  request: Request,
): Promise<RequestUser | null> {
  if (!hasSupabaseEnv()) return null;

  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  const client = createSupabaseClient();
  if (!client) return null;

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id };
}
