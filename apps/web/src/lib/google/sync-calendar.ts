import type { SupabaseClient } from "@supabase/supabase-js";

const SOURCE = "google";

interface GoogleCalendarTarget {
  id: string;
  slug: string;
  label: string;
}

interface GoogleEventItem {
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}

type UpsertFn = (
  client: SupabaseClient,
  table: "calendar_events" | "contacts",
  householdId: string,
  externalId: string,
  row: Record<string, unknown>,
) => Promise<boolean>;

async function resolveCalendarTargets(
  accessToken: string,
): Promise<GoogleCalendarTarget[]> {
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=reader&maxResults=250",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Calendar list ${res.status}: enable Google Calendar API. ${body.slice(0, 160)}`,
    );
  }
  const json = (await res.json()) as {
    items?: Array<{ id?: string; summary?: string; primary?: boolean }>;
  };

  const targets: GoogleCalendarTarget[] = [];
  const seen = new Set<string>();

  for (const item of json.items ?? []) {
    if (!item.id || !item.summary) continue;
    const name = item.summary.trim();
    if (!/^family$/i.test(name) && !/^family\b/i.test(name)) continue;
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    targets.push({ id: item.id, slug: "family", label: name });
  }

  const primary = (json.items ?? []).find((i) => i.primary && i.id);
  if (primary?.id && !seen.has(primary.id)) {
    targets.push({
      id: primary.id,
      slug: "primary",
      label: primary.summary?.trim() || "Primary",
    });
  }

  if (targets.length === 0) {
    targets.push({ id: "primary", slug: "primary", label: "Primary" });
  }
  return targets;
}

async function fetchCalendarEvents(
  accessToken: string,
  calendarId: string,
): Promise<GoogleEventItem[]> {
  const timeMin = new Date();
  timeMin.setMonth(timeMin.getMonth() - 1);
  const timeMax = new Date();
  timeMax.setMonth(timeMax.getMonth() + 3);

  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
  );
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("timeMin", timeMin.toISOString());
  url.searchParams.set("timeMax", timeMax.toISOString());
  url.searchParams.set("maxResults", "100");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Calendar API ${res.status} (${calendarId}): ${body.slice(0, 160)}`,
    );
  }
  const json = (await res.json()) as { items?: GoogleEventItem[] };
  return json.items ?? [];
}

export async function syncGoogleCalendars(
  client: SupabaseClient,
  accessToken: string,
  householdId: string,
  userId: string,
  upsertByExternal: UpsertFn,
): Promise<{ count: number; calendarsSynced: string[] }> {
  const targets = await resolveCalendarTargets(accessToken);
  let count = 0;

  for (const cal of targets) {
    const items = await fetchCalendarEvents(accessToken, cal.id);
    for (const item of items) {
      if (!item.id) continue;
      const start =
        item.start?.dateTime ||
        (item.start?.date ? `${item.start.date}T00:00:00.000Z` : null);
      const end =
        item.end?.dateTime ||
        (item.end?.date ? `${item.end.date}T23:59:59.000Z` : start);
      if (!start || !end) continue;

      const externalId = `${cal.slug}::${item.id}`;
      const ok = await upsertByExternal(
        client,
        "calendar_events",
        householdId,
        externalId,
        {
          household_id: householdId,
          title: item.summary || "Untitled event",
          start_at: start,
          end_at: end,
          location: item.location || null,
          notes: item.description || `Calendar: ${cal.label}`,
          participants: [],
          visibility: "private",
          owner_id: userId,
          created_by: userId,
          external_source: SOURCE,
          external_id: externalId,
          updated_at: new Date().toISOString(),
        },
      );
      if (ok) count += 1;
    }
  }

  return { count, calendarsSynced: targets.map((t) => t.label) };
}
