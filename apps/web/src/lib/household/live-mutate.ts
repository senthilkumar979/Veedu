import { createSupabaseClient } from "@veedu/api";
import type {
  Account,
  Bill,
  CalendarEvent,
  Contact,
  Document,
  HomeItem,
  HomeService,
  ImportantDate,
  Place,
  Subscription,
  Task,
} from "@veedu/types";
import {
  deleteDocumentFile,
  uploadDocumentFile,
} from "@/lib/document-storage";
import { logDocumentActivity } from "@/lib/document-activity";
import { liveUpdateRow } from "./live-patch";

export interface LiveCtx {
  householdId: string;
  userId: string;
}

function clientOrThrow() {
  const client = createSupabaseClient();
  if (!client) throw new Error("Supabase not configured");
  return client;
}

async function insertRow<T>(
  table: string,
  row: Record<string, unknown>,
): Promise<T> {
  const client = clientOrThrow();
  const { data, error } = await client.from(table).insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return data as T;
}

async function updateRow<T>(
  table: string,
  id: string,
  patch: Record<string, unknown>,
): Promise<T> {
  return liveUpdateRow<T>(table, id, patch);
}

export const liveMutate = {
  addTask(ctx: LiveCtx, input: Partial<Task> & { title: string }) {
    return insertRow<Task>("tasks", {
      household_id: ctx.householdId,
      title: input.title,
      description: input.description ?? null,
      category: input.category ?? "Other",
      priority: input.priority ?? "medium",
      status: input.status ?? "todo",
      owner_id: input.owner_id ?? ctx.userId,
      due_date: input.due_date ?? null,
      visibility: input.visibility ?? "shared",
      created_by: ctx.userId,
    });
  },
  updateTask(_ctx: LiveCtx, input: { id: string; patch: Partial<Task> }) {
    return updateRow<Task>("tasks", input.id, input.patch as Record<string, unknown>);
  },
  addBill(
    ctx: LiveCtx,
    input: Partial<Bill> &
      Pick<Bill, "name" | "amount" | "currency" | "due_date" | "frequency" | "status" | "visibility">,
  ) {
    return insertRow<Bill>("bills", {
      household_id: ctx.householdId,
      name: input.name,
      provider: input.provider ?? null,
      amount: Number(input.amount),
      currency: input.currency,
      due_date: input.due_date,
      frequency: input.frequency,
      category: input.category ?? null,
      status: input.status,
      document_id: input.document_id ?? null,
      owner_id: input.owner_id ?? ctx.userId,
      visibility: input.visibility,
      notes: input.notes ?? null,
      created_by: ctx.userId,
    });
  },
  addSubscription(
    ctx: LiveCtx,
    input: Partial<Subscription> &
      Pick<
        Subscription,
        | "name"
        | "amount"
        | "currency"
        | "billing_frequency"
        | "next_renewal"
        | "status"
        | "visibility"
      >,
  ) {
    return insertRow<Subscription>("subscriptions", {
      household_id: ctx.householdId,
      name: input.name,
      provider: input.provider ?? null,
      amount: Number(input.amount),
      currency: input.currency,
      billing_frequency: input.billing_frequency,
      next_renewal: input.next_renewal,
      category: input.category ?? null,
      status: input.status,
      owner_id: input.owner_id ?? ctx.userId,
      visibility: input.visibility,
      payment_reference: input.payment_reference ?? null,
      notes: input.notes ?? null,
      created_by: ctx.userId,
    });
  },
  async addDocument(
    ctx: LiveCtx,
    input: Partial<Document> & { title: string; file?: File },
  ) {
    const shareUrl =
      typeof input.share_url === "string" && input.share_url.trim()
        ? input.share_url.trim()
        : null;
    const row = await insertRow<Document>("documents", {
      household_id: ctx.householdId,
      title: input.title,
      category: input.category ?? "Other",
      status: input.status ?? "valid",
      issued_at: input.issued_at || null,
      expires_at: input.expires_at || null,
      file_path: null,
      file_name: shareUrl ? "Adobe share link" : null,
      mime_type: shareUrl ? "text/uri-list" : null,
      share_url: shareUrl,
      owner_id: ctx.userId,
      visibility: input.visibility ?? "shared",
      notes: input.notes ?? null,
      created_by: ctx.userId,
    });
    if (!input.file) {
      await logDocumentActivity({
        householdId: ctx.householdId,
        documentId: row.id,
        userId: ctx.userId,
        action: "uploaded",
      });
      return row;
    }
    const uploaded = await uploadDocumentFile({
      householdId: ctx.householdId,
      documentId: row.id,
      file: input.file,
    });
    const updated = await updateRow<Document>("documents", row.id, {
      ...uploaded,
      share_url: shareUrl,
    });
    await logDocumentActivity({
      householdId: ctx.householdId,
      documentId: row.id,
      userId: ctx.userId,
      action: "uploaded",
    });
    return updated;
  },
  async replaceDocumentFile(
    ctx: LiveCtx,
    input: { id: string; previousPath: string | null; file: File },
  ) {
    const uploaded = await uploadDocumentFile({
      householdId: ctx.householdId,
      documentId: input.id,
      file: input.file,
    });
    if (input.previousPath && input.previousPath !== uploaded.file_path) {
      await deleteDocumentFile(input.previousPath);
    }
    const updated = await updateRow<Document>("documents", input.id, uploaded);
    await logDocumentActivity({
      householdId: ctx.householdId,
      documentId: input.id,
      userId: ctx.userId,
      action: "replaced",
    });
    return updated;
  },
  addAccount(
    ctx: LiveCtx,
    input: Partial<Account> &
      Pick<Account, "institution" | "nickname" | "account_type" | "visibility">,
  ) {
    return insertRow<Account>("accounts", {
      household_id: ctx.householdId,
      institution: input.institution,
      nickname: input.nickname,
      account_type: input.account_type,
      reference: input.reference ?? null,
      last_four: input.last_four ?? null,
      owner_id: ctx.userId,
      visibility: input.visibility,
      notes: input.notes ?? null,
      created_by: ctx.userId,
    });
  },
  addContact(
    ctx: LiveCtx,
    input: Partial<Contact> & Pick<Contact, "name" | "category" | "visibility">,
  ) {
    return insertRow<Contact>("contacts", {
      household_id: ctx.householdId,
      name: input.name,
      phone: input.phone ?? null,
      email: input.email || null,
      address: input.address ?? null,
      category: input.category,
      notes: input.notes ?? null,
      owner_id: ctx.userId,
      visibility: input.visibility,
      created_by: ctx.userId,
    });
  },
  addPlace(
    ctx: LiveCtx,
    input: Partial<Place> &
      Pick<Place, "name" | "category" | "visibility" | "visited" | "tags">,
  ) {
    return insertRow<Place>("places", {
      household_id: ctx.householdId,
      name: input.name,
      address: input.address ?? null,
      website: input.website || null,
      rating: input.rating ?? null,
      category: input.category,
      tags: input.tags ?? [],
      notes: input.notes ?? null,
      visited: input.visited ?? false,
      owner_id: ctx.userId,
      visibility: input.visibility,
      created_by: ctx.userId,
    });
  },
  addImportantDate(
    ctx: LiveCtx,
    input: Partial<ImportantDate> &
      Pick<ImportantDate, "title" | "date" | "category" | "visibility">,
  ) {
    return insertRow<ImportantDate>("important_dates", {
      household_id: ctx.householdId,
      title: input.title,
      date: input.date,
      category: input.category,
      notes: input.notes ?? null,
      reminder_days: input.reminder_days ?? null,
      owner_id: ctx.userId,
      visibility: input.visibility,
      created_by: ctx.userId,
    });
  },
  addHomeItem(
    ctx: LiveCtx,
    input: Partial<HomeItem> & Pick<HomeItem, "name" | "category" | "visibility">,
  ) {
    return insertRow<HomeItem>("home_items", {
      household_id: ctx.householdId,
      name: input.name,
      category: input.category,
      purchased_at: input.purchased_at || null,
      warranty_until: input.warranty_until || null,
      notes: input.notes ?? null,
      owner_id: ctx.userId,
      visibility: input.visibility,
      created_by: ctx.userId,
    });
  },
  addHomeService(
    ctx: LiveCtx,
    input: Partial<HomeService> & Pick<HomeService, "name" | "visibility">,
  ) {
    return insertRow<HomeService>("home_services", {
      household_id: ctx.householdId,
      name: input.name,
      provider: input.provider ?? null,
      last_serviced_at: input.last_serviced_at || null,
      next_due_at: input.next_due_at || null,
      notes: input.notes ?? null,
      owner_id: ctx.userId,
      visibility: input.visibility,
      created_by: ctx.userId,
    });
  },
  addEvent(
    ctx: LiveCtx,
    input: Partial<CalendarEvent> & {
      title: string;
      start_at: string;
      end_at: string;
    },
  ) {
    return insertRow<CalendarEvent>("calendar_events", {
      household_id: ctx.householdId,
      title: input.title,
      start_at: input.start_at,
      end_at: input.end_at,
      location: input.location ?? null,
      notes: input.notes ?? null,
      participants: input.participants ?? [],
      visibility: input.visibility ?? "shared",
      owner_id: ctx.userId,
      created_by: ctx.userId,
    });
  },
};
