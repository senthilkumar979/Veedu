import { createSupabaseClient } from "@veedu/api";

export async function bearerAuthHeaders(): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const client = createSupabaseClient();
  if (!client) return headers;
  const { data } = await client.auth.getSession();
  if (data.session?.access_token) {
    headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  return headers;
}
