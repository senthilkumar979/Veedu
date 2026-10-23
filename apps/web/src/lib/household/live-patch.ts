import { createSupabaseClient } from "@veedu/api";
import type { Household } from "@veedu/types";

function clientOrThrow() {
  const client = createSupabaseClient();
  if (!client) throw new Error("Supabase not configured");
  return client;
}

export type ArchivableTable =
  | "tasks"
  | "bills"
  | "subscriptions"
  | "documents"
  | "accounts"
  | "contacts"
  | "places"
  | "important_dates"
  | "home_items"
  | "home_services";

export async function liveUpdateRow<T>(
  table: string,
  id: string,
  patch: Record<string, unknown>,
): Promise<T> {
  const client = clientOrThrow();
  const { data, error } = await client
    .from(table)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as T;
}

export async function liveArchiveRow(
  table: ArchivableTable,
  id: string,
): Promise<void> {
  await liveUpdateRow(table, id, {
    archived_at: new Date().toISOString(),
  });
}

export async function liveDeleteEvent(id: string): Promise<void> {
  const client = clientOrThrow();
  const { error } = await client.from("calendar_events").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function liveUpdateHousehold(
  householdId: string,
  patch: Partial<
    Pick<
      Household,
      | "name"
      | "home_location"
      | "parents_location"
      | "parents_locations"
      | "timezone"
      | "currency"
    >
  >,
): Promise<Household> {
  return liveUpdateRow<Household>("households", householdId, {
    name: patch.name,
    home_location: patch.home_location ?? null,
    parents_location: patch.parents_location ?? null,
    parents_locations: patch.parents_locations ?? [],
    timezone: patch.timezone,
    currency: patch.currency,
  });
}
