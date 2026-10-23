"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { liveList } from "./household/live-list";
import { liveMutate } from "./household/live-mutate";
import { useEntityMutations } from "./household/use-entity-mutations";

export function useHouseholdData() {
  const { household, profile, isAuthenticated } = useAuth();
  const qc = useQueryClient();
  const householdId = household?.id;
  const userId = profile?.id;
  const liveCtx =
    householdId && userId ? { householdId, userId } : null;

  const enabled = isAuthenticated && Boolean(householdId && userId);

  function invalidateAll() {
    void qc.invalidateQueries();
  }

  const tasks = useQuery({
    queryKey: ["tasks", householdId],
    enabled,
    queryFn: () => liveList.tasks(householdId!),
  });

  const events = useQuery({
    queryKey: ["events", householdId],
    enabled,
    queryFn: () => liveList.events(householdId!),
  });

  const bills = useQuery({
    queryKey: ["bills", householdId],
    enabled,
    queryFn: () => liveList.bills(householdId!),
  });

  const subscriptions = useQuery({
    queryKey: ["subscriptions", householdId],
    enabled,
    queryFn: () => liveList.subscriptions(householdId!),
  });

  const documents = useQuery({
    queryKey: ["documents", householdId],
    enabled,
    queryFn: () => liveList.documents(householdId!),
  });

  const accounts = useQuery({
    queryKey: ["accounts", householdId],
    enabled,
    queryFn: () => liveList.accounts(householdId!),
  });

  const contacts = useQuery({
    queryKey: ["contacts", householdId],
    enabled,
    queryFn: () => liveList.contacts(householdId!),
  });

  const places = useQuery({
    queryKey: ["places", householdId],
    enabled,
    queryFn: () => liveList.places(householdId!),
  });

  const importantDates = useQuery({
    queryKey: ["important-dates", householdId],
    enabled,
    queryFn: () => liveList.importantDates(householdId!),
  });

  const homeItems = useQuery({
    queryKey: ["home-items", householdId],
    enabled,
    queryFn: () => liveList.homeItems(householdId!),
  });

  const homeServices = useQuery({
    queryKey: ["home-services", householdId],
    enabled,
    queryFn: () => liveList.homeServices(householdId!),
  });

  const notifications = useQuery({
    queryKey: ["notifications", householdId, userId],
    enabled,
    queryFn: () => liveList.notifications(householdId!, userId!),
  });

  const documentActivities = useQuery({
    queryKey: ["document-activities", householdId],
    enabled,
    queryFn: () => liveList.documentActivities(householdId!),
  });

  const members = useQuery({
    queryKey: ["members", householdId],
    enabled,
    queryFn: () => liveList.members(householdId!),
  });

  const entity = useEntityMutations({
    liveCtx,
    onSuccess: invalidateAll,
  });

  const addTask = useMutation({
    mutationFn: async (input: Partial<Task> & { title: string }) => {
      if (!liveCtx) throw new Error("Not authenticated");
      return liveMutate.addTask(liveCtx, input);
    },
    onSuccess: invalidateAll,
  });

  const addBill = useMutation({
    mutationFn: async (
      input: Partial<Bill> &
        Pick<
          Bill,
          | "name"
          | "amount"
          | "currency"
          | "due_date"
          | "frequency"
          | "status"
          | "visibility"
        >,
    ) => {
      if (!liveCtx) throw new Error("Not authenticated");
      return liveMutate.addBill(liveCtx, input);
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
      if (!liveCtx) throw new Error("Not authenticated");
      return liveMutate.addSubscription(liveCtx, input);
    },
    onSuccess: invalidateAll,
  });

  const addDocument = useMutation({
    mutationFn: async (
      input: Partial<Document> & { title: string; file?: File },
    ) => {
      if (!liveCtx) throw new Error("Not authenticated");
      return liveMutate.addDocument(liveCtx, input);
    },
    onSuccess: invalidateAll,
  });

  const replaceDocumentFile = useMutation({
    mutationFn: async (input: {
      id: string;
      previousPath: string | null;
      file: File;
    }) => {
      if (!liveCtx) throw new Error("Not authenticated");
      return liveMutate.replaceDocumentFile(liveCtx, input);
    },
    onSuccess: invalidateAll,
  });

  const addAccount = useMutation({
    mutationFn: async (
      input: Partial<Account> &
        Pick<Account, "institution" | "nickname" | "account_type" | "visibility">,
    ) => {
      if (!liveCtx) throw new Error("Not authenticated");
      return liveMutate.addAccount(liveCtx, input);
    },
    onSuccess: invalidateAll,
  });

  const addContact = useMutation({
    mutationFn: async (
      input: Partial<Contact> & Pick<Contact, "name" | "category" | "visibility">,
    ) => {
      if (!liveCtx) throw new Error("Not authenticated");
      return liveMutate.addContact(liveCtx, input);
    },
    onSuccess: invalidateAll,
  });

  const addPlace = useMutation({
    mutationFn: async (
      input: Partial<Place> &
        Pick<Place, "name" | "category" | "visibility" | "visited" | "tags">,
    ) => {
      if (!liveCtx) throw new Error("Not authenticated");
      return liveMutate.addPlace(liveCtx, input);
    },
    onSuccess: invalidateAll,
  });

  const addImportantDate = useMutation({
    mutationFn: async (
      input: Partial<ImportantDate> &
        Pick<ImportantDate, "title" | "date" | "category" | "visibility">,
    ) => {
      if (!liveCtx) throw new Error("Not authenticated");
      return liveMutate.addImportantDate(liveCtx, input);
    },
    onSuccess: invalidateAll,
  });

  const addHomeItem = useMutation({
    mutationFn: async (
      input: Partial<HomeItem> &
        Pick<HomeItem, "name" | "category" | "visibility">,
    ) => {
      if (!liveCtx) throw new Error("Not authenticated");
      return liveMutate.addHomeItem(liveCtx, input);
    },
    onSuccess: invalidateAll,
  });

  const addHomeService = useMutation({
    mutationFn: async (
      input: Partial<HomeService> & Pick<HomeService, "name" | "visibility">,
    ) => {
      if (!liveCtx) throw new Error("Not authenticated");
      return liveMutate.addHomeService(liveCtx, input);
    },
    onSuccess: invalidateAll,
  });

  const addEvent = useMutation({
    mutationFn: async (
      input: Partial<CalendarEvent> & {
        title: string;
        start_at: string;
        end_at: string;
      },
    ) => {
      if (!liveCtx) throw new Error("Not authenticated");
      return liveMutate.addEvent(liveCtx, input);
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
    documentActivities,
    members,
    addTask,
    addBill,
    addSubscription,
    addDocument,
    replaceDocumentFile,
    addAccount,
    addContact,
    addPlace,
    addImportantDate,
    addHomeItem,
    addHomeService,
    addEvent,
    ...entity,
  };
}
