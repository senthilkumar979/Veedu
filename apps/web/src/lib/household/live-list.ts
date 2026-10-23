import { createSupabaseClient } from "@veedu/api";
import type {
  Account,
  AppNotification,
  Bill,
  CalendarEvent,
  Contact,
  Document,
  DocumentActivity,
  HomeItem,
  HomeService,
  ImportantDate,
  Place,
  Subscription,
  Task,
} from "@veedu/types";

export interface HouseholdMemberRow {
  id: string;
  household_id: string;
  user_id: string;
  role: string;
  status: string;
  display_name: string;
  created_at: string;
  profiles?: { email: string; full_name: string; avatar_url: string | null } | null;
}

function clientOrThrow() {
  const client = createSupabaseClient();
  if (!client) throw new Error("Supabase not configured");
  return client;
}

async function listByHousehold<T>(
  table: string,
  householdId: string,
): Promise<T[]> {
  const client = clientOrThrow();
  const { data, error } = await client
    .from(table)
    .select("*")
    .eq("household_id", householdId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

export const liveList = {
  tasks: (hid: string) => listByHousehold<Task>("tasks", hid),
  bills: (hid: string) => listByHousehold<Bill>("bills", hid),
  subscriptions: (hid: string) =>
    listByHousehold<Subscription>("subscriptions", hid),
  documents: (hid: string) => listByHousehold<Document>("documents", hid),
  accounts: (hid: string) => listByHousehold<Account>("accounts", hid),
  contacts: (hid: string) => listByHousehold<Contact>("contacts", hid),
  places: (hid: string) => listByHousehold<Place>("places", hid),
  importantDates: (hid: string) =>
    listByHousehold<ImportantDate>("important_dates", hid),
  homeItems: (hid: string) => listByHousehold<HomeItem>("home_items", hid),
  homeServices: (hid: string) =>
    listByHousehold<HomeService>("home_services", hid),
  async events(hid: string): Promise<CalendarEvent[]> {
    const client = clientOrThrow();
    const { data, error } = await client
      .from("calendar_events")
      .select("*")
      .eq("household_id", hid)
      .order("start_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as CalendarEvent[];
  },
  async notifications(
    hid: string,
    userId: string,
  ): Promise<AppNotification[]> {
    const client = clientOrThrow();
    const { data, error } = await client
      .from("notifications")
      .select("*")
      .eq("household_id", hid)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as AppNotification[];
  },
  async documentActivities(hid: string): Promise<DocumentActivity[]> {
    const client = clientOrThrow();
    const { data, error } = await client
      .from("document_activities")
      .select("*")
      .eq("household_id", hid)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []) as DocumentActivity[];
  },
  async members(hid: string): Promise<HouseholdMemberRow[]> {
    const client = clientOrThrow();
    const { data, error } = await client
      .from("household_members")
      .select("*, profiles(email, full_name, avatar_url)")
      .eq("household_id", hid)
      .eq("status", "active")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as HouseholdMemberRow[];
  },
};
