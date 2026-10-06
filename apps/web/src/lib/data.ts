"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDemoStore, uid } from "@veedu/api";
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
import { useAuth } from "./auth";

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function useHouseholdData() {
  const { store, isAuthenticated, refreshStore } = useAuth();
  const qc = useQueryClient();

  const enabled = isAuthenticated && Boolean(store);

  const tasks = useQuery({
    queryKey: ["tasks"],
    enabled,
    queryFn: () => delay([...(store?.tasks ?? getDemoStore().tasks)]),
  });

  const events = useQuery({
    queryKey: ["events"],
    enabled,
    queryFn: () => delay([...(store?.events ?? [])]),
  });

  const bills = useQuery({
    queryKey: ["bills"],
    enabled,
    queryFn: () => delay([...(store?.bills ?? [])]),
  });

  const subscriptions = useQuery({
    queryKey: ["subscriptions"],
    enabled,
    queryFn: () => delay([...(store?.subscriptions ?? [])]),
  });

  const documents = useQuery({
    queryKey: ["documents"],
    enabled,
    queryFn: () => delay([...(store?.documents ?? [])]),
  });

  const accounts = useQuery({
    queryKey: ["accounts"],
    enabled,
    queryFn: () => delay([...(store?.accounts ?? [])]),
  });

  const contacts = useQuery({
    queryKey: ["contacts"],
    enabled,
    queryFn: () => delay([...(store?.contacts ?? [])]),
  });

  const places = useQuery({
    queryKey: ["places"],
    enabled,
    queryFn: () => delay([...(store?.places ?? [])]),
  });

  const importantDates = useQuery({
    queryKey: ["important-dates"],
    enabled,
    queryFn: () => delay([...(store?.importantDates ?? [])]),
  });

  const homeItems = useQuery({
    queryKey: ["home-items"],
    enabled,
    queryFn: () => delay([...(store?.homeItems ?? [])]),
  });

  const homeServices = useQuery({
    queryKey: ["home-services"],
    enabled,
    queryFn: () => delay([...(store?.homeServices ?? [])]),
  });

  const notifications = useQuery({
    queryKey: ["notifications"],
    enabled,
    queryFn: () => delay([...(store?.notifications ?? [])]),
  });

  function invalidateAll() {
    refreshStore();
    void qc.invalidateQueries();
  }

  const addTask = useMutation({
    mutationFn: async (input: Partial<Task> & { title: string }) => {
      const demo = getDemoStore();
      const task: Task = {
        id: uid("t"),
        household_id: demo.household.id,
        title: input.title,
        description: input.description ?? null,
        category_id: null,
        category: input.category ?? "Other",
        priority: input.priority ?? "medium",
        status: input.status ?? "todo",
        owner_id: input.owner_id ?? demo.profile.id,
        due_date: input.due_date ?? null,
        visibility: input.visibility ?? "shared",
        created_by: demo.profile.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      };
      demo.tasks.unshift(task);
      return delay(task);
    },
    onSuccess: invalidateAll,
  });

  const updateTask = useMutation({
    mutationFn: async (input: { id: string; patch: Partial<Task> }) => {
      const demo = getDemoStore();
      const idx = demo.tasks.findIndex((t) => t.id === input.id);
      if (idx >= 0) {
        demo.tasks[idx] = {
          ...demo.tasks[idx],
          ...input.patch,
          updated_at: new Date().toISOString(),
        };
        return delay(demo.tasks[idx]);
      }
      throw new Error("Task not found");
    },
    onSuccess: invalidateAll,
  });

  const addBill = useMutation({
    mutationFn: async (input: Partial<Bill> & Pick<Bill, "name" | "amount" | "currency" | "due_date" | "frequency" | "status" | "visibility">) => {
      const demo = getDemoStore();
      const bill: Bill = {
        id: uid("b"),
        household_id: demo.household.id,
        name: input.name,
        provider: input.provider ?? null,
        amount: Number(input.amount),
        currency: input.currency,
        due_date: input.due_date,
        frequency: input.frequency,
        category: input.category ?? null,
        status: input.status,
        owner_id: input.owner_id ?? demo.profile.id,
        visibility: input.visibility,
        notes: input.notes ?? null,
        created_by: demo.profile.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      };
      demo.bills.unshift(bill);
      return delay(bill);
    },
    onSuccess: invalidateAll,
  });

  const addSubscription = useMutation({
    mutationFn: async (
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
    ) => {
      const demo = getDemoStore();
      const row: Subscription = {
        id: uid("s"),
        household_id: demo.household.id,
        name: input.name,
        provider: input.provider ?? null,
        amount: Number(input.amount),
        currency: input.currency,
        billing_frequency: input.billing_frequency,
        next_renewal: input.next_renewal,
        category: input.category ?? null,
        status: input.status,
        owner_id: input.owner_id ?? demo.profile.id,
        visibility: input.visibility,
        payment_reference: input.payment_reference ?? null,
        notes: input.notes ?? null,
        created_by: demo.profile.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      };
      demo.subscriptions.unshift(row);
      return delay(row);
    },
    onSuccess: invalidateAll,
  });

  const addDocument = useMutation({
    mutationFn: async (
      input: Partial<Document> & { title: string },
    ) => {
      const demo = getDemoStore();
      const row: Document = {
        id: uid("d"),
        household_id: demo.household.id,
        title: input.title,
        category_id: null,
        category: input.category ?? "Other",
        status: input.status ?? "valid",
        issued_at: input.issued_at ?? null,
        expires_at: input.expires_at ?? null,
        file_path: input.file_path ?? `households/${demo.household.id}/documents/${uid("f")}/file.pdf`,
        file_name: input.file_name ?? "document.pdf",
        mime_type: input.mime_type ?? "application/pdf",
        owner_id: demo.profile.id,
        visibility: input.visibility ?? "shared",
        notes: input.notes ?? null,
        created_by: demo.profile.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      };
      demo.documents.unshift(row);
      return delay(row);
    },
    onSuccess: invalidateAll,
  });

  const addAccount = useMutation({
    mutationFn: async (
      input: Partial<Account> &
        Pick<Account, "institution" | "nickname" | "account_type" | "visibility">,
    ) => {
      const demo = getDemoStore();
      const row: Account = {
        id: uid("a"),
        household_id: demo.household.id,
        institution: input.institution,
        nickname: input.nickname,
        account_type: input.account_type,
        reference: input.reference ?? null,
        last_four: input.last_four ?? null,
        owner_id: demo.profile.id,
        visibility: input.visibility,
        notes: input.notes ?? null,
        created_by: demo.profile.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      };
      demo.accounts.unshift(row);
      return delay(row);
    },
    onSuccess: invalidateAll,
  });

  const addContact = useMutation({
    mutationFn: async (
      input: Partial<Contact> & Pick<Contact, "name" | "category" | "visibility">,
    ) => {
      const demo = getDemoStore();
      const row: Contact = {
        id: uid("c"),
        household_id: demo.household.id,
        name: input.name,
        phone: input.phone ?? null,
        email: input.email ?? null,
        address: input.address ?? null,
        category: input.category,
        notes: input.notes ?? null,
        owner_id: demo.profile.id,
        visibility: input.visibility,
        created_by: demo.profile.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      };
      demo.contacts.unshift(row);
      return delay(row);
    },
    onSuccess: invalidateAll,
  });

  const addPlace = useMutation({
    mutationFn: async (
      input: Partial<Place> &
        Pick<Place, "name" | "category" | "visibility" | "visited" | "tags">,
    ) => {
      const demo = getDemoStore();
      const row: Place = {
        id: uid("p"),
        household_id: demo.household.id,
        name: input.name,
        address: input.address ?? null,
        website: input.website ?? null,
        rating: input.rating ?? null,
        category: input.category,
        tags: input.tags ?? [],
        notes: input.notes ?? null,
        visited: input.visited ?? false,
        owner_id: demo.profile.id,
        visibility: input.visibility,
        created_by: demo.profile.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      };
      demo.places.unshift(row);
      return delay(row);
    },
    onSuccess: invalidateAll,
  });

  const addImportantDate = useMutation({
    mutationFn: async (
      input: Partial<ImportantDate> &
        Pick<ImportantDate, "title" | "date" | "category" | "visibility">,
    ) => {
      const demo = getDemoStore();
      const row: ImportantDate = {
        id: uid("id"),
        household_id: demo.household.id,
        title: input.title,
        date: input.date,
        category: input.category,
        notes: input.notes ?? null,
        reminder_days: input.reminder_days ?? null,
        owner_id: demo.profile.id,
        visibility: input.visibility,
        created_by: demo.profile.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      };
      demo.importantDates.unshift(row);
      return delay(row);
    },
    onSuccess: invalidateAll,
  });

  const addHomeItem = useMutation({
    mutationFn: async (
      input: Partial<HomeItem> &
        Pick<HomeItem, "name" | "category" | "visibility">,
    ) => {
      const demo = getDemoStore();
      const row: HomeItem = {
        id: uid("hi"),
        household_id: demo.household.id,
        name: input.name,
        category: input.category,
        purchased_at: input.purchased_at ?? null,
        warranty_until: input.warranty_until ?? null,
        notes: input.notes ?? null,
        owner_id: demo.profile.id,
        visibility: input.visibility,
        created_by: demo.profile.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      };
      demo.homeItems.unshift(row);
      return delay(row);
    },
    onSuccess: invalidateAll,
  });

  const addHomeService = useMutation({
    mutationFn: async (
      input: Partial<HomeService> & Pick<HomeService, "name" | "visibility">,
    ) => {
      const demo = getDemoStore();
      const row: HomeService = {
        id: uid("hs"),
        household_id: demo.household.id,
        name: input.name,
        provider: input.provider ?? null,
        last_serviced_at: input.last_serviced_at ?? null,
        next_due_at: input.next_due_at ?? null,
        notes: input.notes ?? null,
        owner_id: demo.profile.id,
        visibility: input.visibility,
        created_by: demo.profile.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      };
      demo.homeServices.unshift(row);
      return delay(row);
    },
    onSuccess: invalidateAll,
  });

  const addEvent = useMutation({
    mutationFn: async (
      input: Partial<CalendarEvent> & { title: string; start_at: string; end_at: string },
    ) => {
      const demo = getDemoStore();
      const row: CalendarEvent = {
        id: uid("e"),
        household_id: demo.household.id,
        title: input.title,
        start_at: input.start_at,
        end_at: input.end_at,
        location: input.location ?? null,
        notes: input.notes ?? null,
        participants: input.participants ?? [],
        visibility: input.visibility ?? "shared",
        owner_id: demo.profile.id,
        created_by: demo.profile.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      demo.events.unshift(row);
      return delay(row);
    },
    onSuccess: invalidateAll,
  });

  return {
    tasks,
    events,
    bills,
    subscriptions,
    documents,
    accounts,
    contacts,
    places,
    importantDates,
    homeItems,
    homeServices,
    notifications,
    addTask,
    updateTask,
    addBill,
    addSubscription,
    addDocument,
    addAccount,
    addContact,
    addPlace,
    addImportantDate,
    addHomeItem,
    addHomeService,
    addEvent,
  };
}
