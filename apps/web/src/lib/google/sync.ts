import type { SupabaseClient } from "@supabase/supabase-js";
import { refreshAccessToken } from "./tokens";
import { syncGoogleCalendars } from "./sync-calendar";

const SOURCE = "google";

interface SyncResult {
  eventsUpserted: number;
  contactsUpserted: number;
  calendarsSynced: string[];
}

async function ensureAccessToken(
  admin: SupabaseClient,
  row: {
    access_token: string;
    refresh_token: string | null;
    expires_at: string | null;
    user_id: string;
  },
): Promise<string> {
  const expires = row.expires_at ? new Date(row.expires_at).getTime() : 0;
  if (expires > Date.now() + 60_000) return row.access_token;
  if (!row.refresh_token) return row.access_token;

  const refreshed = await refreshAccessToken(row.refresh_token);
  await admin
    .from("google_connections")
    .update({
      access_token: refreshed.access_token,
      expires_at: refreshed.expires_in
        ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", row.user_id);
  return refreshed.access_token;
}

async function upsertByExternal(
  client: SupabaseClient,
  table: "calendar_events" | "contacts",
  householdId: string,
  externalId: string,
  row: Record<string, unknown>,
): Promise<boolean> {
  const { data: existing } = await client
    .from(table)
    .select("id")
    .eq("household_id", householdId)
    .eq("external_source", SOURCE)
    .eq("external_id", externalId)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await client.from(table).update(row).eq("id", existing.id);
    if (error) throw new Error(`${table} update: ${error.message}`);
    return true;
  }
  const { error } = await client.from(table).insert(row);
  if (error) throw new Error(`${table} insert: ${error.message}`);
  return true;
}

async function syncContacts(
  client: SupabaseClient,
  accessToken: string,
  householdId: string,
  userId: string,
): Promise<number> {
  const url = new URL(
    "https://people.googleapis.com/v1/people/me/connections",
  );
  url.searchParams.set(
    "personFields",
    "names,emailAddresses,phoneNumbers,addresses",
  );
  url.searchParams.set("pageSize", "100");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `People API ${res.status}: enable People API in Cloud Console. ${body.slice(0, 180)}`,
    );
  }
  const json = (await res.json()) as {
    connections?: Array<{
      resourceName?: string;
      names?: Array<{ displayName?: string }>;
      emailAddresses?: Array<{ value?: string }>;
      phoneNumbers?: Array<{ value?: string }>;
      addresses?: Array<{ formattedValue?: string }>;
    }>;
  };

  let count = 0;
  for (const person of json.connections ?? []) {
    const externalId = person.resourceName;
    if (!externalId) continue;
    const name = person.names?.[0]?.displayName?.trim();
    if (!name) continue;

    const ok = await upsertByExternal(client, "contacts", householdId, externalId, {
      household_id: householdId,
      name,
      email: person.emailAddresses?.[0]?.value || null,
      phone: person.phoneNumbers?.[0]?.value || null,
      address: person.addresses?.[0]?.formattedValue || null,
      category: "Other",
      notes: null,
      visibility: "private",
      owner_id: userId,
      created_by: userId,
      external_source: SOURCE,
      external_id: externalId,
      updated_at: new Date().toISOString(),
    });
    if (ok) count += 1;
  }
  return count;
}

export async function syncGoogleIntoHousehold(
  admin: SupabaseClient,
  userClient: SupabaseClient,
  userId: string,
  householdId: string,
): Promise<SyncResult> {
  const { data: conn, error } = await admin
    .from("google_connections")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !conn) throw new Error("Google account not connected");

  const accessToken = await ensureAccessToken(admin, conn);
  const { count: eventsUpserted, calendarsSynced } = await syncGoogleCalendars(
    userClient,
    accessToken,
    householdId,
    userId,
    upsertByExternal,
  );
  const contactsUpserted = await syncContacts(
    userClient,
    accessToken,
    householdId,
    userId,
  );
  return { eventsUpserted, contactsUpserted, calendarsSynced };
}
