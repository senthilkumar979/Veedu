"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  liveArchiveRow,
  liveDeleteEvent,
  liveUpdateRow,
  type ArchivableTable,
} from "./live-patch";
import type { LiveCtx } from "./live-mutate";

interface Options {
  liveCtx: LiveCtx | null;
  onSuccess: () => void;
}

function usePatchMutation<T>(
  options: Options,
  liveTable: ArchivableTable | "calendar_events",
) {
  const { onSuccess } = options;
  return useMutation({
    mutationFn: async (input: { id: string; patch: Partial<T> }) => {
      if (!options.liveCtx) throw new Error("Not authenticated");
      return liveUpdateRow<T>(
        liveTable,
        input.id,
        input.patch as Record<string, unknown>,
      );
    },
    onSuccess,
  });
}

function useArchiveMutation(options: Options, liveTable: ArchivableTable) {
  const { onSuccess } = options;
  return useMutation({
    mutationFn: async (id: string) => {
      if (!options.liveCtx) throw new Error("Not authenticated");
      await liveArchiveRow(liveTable, id);
    },
    onSuccess,
  });
}

export function useEntityMutations(options: Options) {
  const qc = useQueryClient();
  const invalidate = () => {
    options.onSuccess();
    void qc.invalidateQueries();
  };
  const opts = { ...options, onSuccess: invalidate };

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      if (!options.liveCtx) throw new Error("Not authenticated");
      await liveDeleteEvent(id);
    },
    onSuccess: invalidate,
  });

  return {
    updateTask: usePatchMutation<Task>(opts, "tasks"),
    archiveTask: useArchiveMutation(opts, "tasks"),
    updateBill: usePatchMutation<Bill>(opts, "bills"),
    archiveBill: useArchiveMutation(opts, "bills"),
    updateSubscription: usePatchMutation<Subscription>(opts, "subscriptions"),
    archiveSubscription: useArchiveMutation(opts, "subscriptions"),
    updateDocument: usePatchMutation<Document>(opts, "documents"),
    archiveDocument: useArchiveMutation(opts, "documents"),
    updateAccount: usePatchMutation<Account>(opts, "accounts"),
    archiveAccount: useArchiveMutation(opts, "accounts"),
    updateContact: usePatchMutation<Contact>(opts, "contacts"),
    archiveContact: useArchiveMutation(opts, "contacts"),
    updatePlace: usePatchMutation<Place>(opts, "places"),
    archivePlace: useArchiveMutation(opts, "places"),
    updateImportantDate: usePatchMutation<ImportantDate>(
      opts,
      "important_dates",
    ),
    archiveImportantDate: useArchiveMutation(opts, "important_dates"),
    updateHomeItem: usePatchMutation<HomeItem>(opts, "home_items"),
    archiveHomeItem: useArchiveMutation(opts, "home_items"),
    updateHomeService: usePatchMutation<HomeService>(opts, "home_services"),
    archiveHomeService: useArchiveMutation(opts, "home_services"),
    updateEvent: usePatchMutation<CalendarEvent>(opts, "calendar_events"),
    deleteEvent,
  };
}
