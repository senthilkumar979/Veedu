import { createSupabaseClient, hasSupabaseEnv } from "@veedu/api";

export interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export interface PushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

function requireClient() {
  if (!hasSupabaseEnv()) throw new Error("Supabase is not configured");
  const client = createSupabaseClient();
  if (!client) throw new Error("Supabase client unavailable");
  return client;
}

export async function upsertPushSubscription(
  userId: string,
  input: PushSubscriptionInput,
): Promise<PushSubscriptionRecord> {
  const client = requireClient();

  const { data, error } = await client
    .from("push_subscriptions")
    .upsert(
      {
        user_id: userId,
        endpoint: input.endpoint,
        p256dh: input.keys.p256dh,
        auth: input.keys.auth,
      },
      { onConflict: "endpoint" },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as PushSubscriptionRecord;
}

export async function deletePushSubscription(
  userId: string,
  endpoint: string,
): Promise<void> {
  const client = requireClient();

  const { error } = await client
    .from("push_subscriptions")
    .delete()
    .eq("user_id", userId)
    .eq("endpoint", endpoint);

  if (error) throw new Error(error.message);
}

export async function listPushSubscriptions(
  userId: string,
): Promise<PushSubscriptionRecord[]> {
  const client = requireClient();

  const { data, error } = await client
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return (data ?? []) as PushSubscriptionRecord[];
}
