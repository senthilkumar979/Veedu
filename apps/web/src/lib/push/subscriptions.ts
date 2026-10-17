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

const demoStore = new Map<string, PushSubscriptionRecord>();

function demoId(): string {
  return `demo-push-${Math.random().toString(36).slice(2, 10)}`;
}

export function isDemoPushMode(): boolean {
  return !hasSupabaseEnv();
}

export async function upsertPushSubscription(
  userId: string,
  input: PushSubscriptionInput,
): Promise<PushSubscriptionRecord> {
  if (isDemoPushMode()) {
    const existing = [...demoStore.values()].find(
      (r) => r.user_id === userId && r.endpoint === input.endpoint,
    );
    if (existing) {
      existing.p256dh = input.keys.p256dh;
      existing.auth = input.keys.auth;
      return existing;
    }
    const record: PushSubscriptionRecord = {
      id: demoId(),
      user_id: userId,
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      created_at: new Date().toISOString(),
    };
    demoStore.set(record.id, record);
    return record;
  }

  const client = createSupabaseClient();
  if (!client) throw new Error("Supabase client unavailable");

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
  if (isDemoPushMode()) {
    for (const [id, row] of demoStore) {
      if (row.user_id === userId && row.endpoint === endpoint) {
        demoStore.delete(id);
      }
    }
    return;
  }

  const client = createSupabaseClient();
  if (!client) throw new Error("Supabase client unavailable");

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
  if (isDemoPushMode()) {
    return [...demoStore.values()].filter((r) => r.user_id === userId);
  }

  const client = createSupabaseClient();
  if (!client) throw new Error("Supabase client unavailable");

  const { data, error } = await client
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return (data ?? []) as PushSubscriptionRecord[];
}

/** Test helper / diagnostics — demo store size. */
export function demoSubscriptionCount(): number {
  return demoStore.size;
}
