"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createSupabaseClient } from "@veedu/api";
import { useAuth } from "@/lib/auth";

const COOLDOWN_MS = 45_000;
const LAST_SYNC_KEY = "veedu_google_last_sync_at";

/**
 * Syncs Google Family (+ primary) calendars once per page visit (with cooldown),
 * then refreshes household events/contacts queries.
 */
export function useGoogleSyncOnLoad() {
  const { household, isAuthenticated } = useAuth();
  const qc = useQueryClient();
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "skipped">(
    "idle",
  );
  const [calendarsSynced, setCalendarsSynced] = useState<string[]>([]);
  const ran = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !household?.id || ran.current) return;
    ran.current = true;

    const last = Number(sessionStorage.getItem(LAST_SYNC_KEY) || 0);
    if (Date.now() - last < COOLDOWN_MS) {
      setStatus("skipped");
      return;
    }

    void (async () => {
      const client = createSupabaseClient();
      if (!client) {
        setStatus("skipped");
        return;
      }
      const { data } = await client.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setStatus("skipped");
        return;
      }

      setStatus("syncing");
      try {
        const res = await fetch("/api/google/sync", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({ householdId: household.id }),
        });
        const json = (await res.json().catch(() => ({}))) as {
          calendarsSynced?: string[];
          error?: string;
        };
        if (res.ok) {
          sessionStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
          setCalendarsSynced(json.calendarsSynced ?? []);
          await qc.invalidateQueries({ queryKey: ["events"] });
          await qc.invalidateQueries({ queryKey: ["contacts"] });
          setStatus("done");
        } else {
          // Not connected / APIs off — stay quiet on dashboard/calendar.
          setStatus("skipped");
        }
      } catch {
        setStatus("skipped");
      }
    })();
  }, [household?.id, isAuthenticated, qc]);

  return { status, calendarsSynced, isSyncing: status === "syncing" };
}
