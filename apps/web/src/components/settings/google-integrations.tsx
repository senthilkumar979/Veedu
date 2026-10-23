"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@veedu/ui";
import { createSupabaseClient } from "@veedu/api";
import { useAuth } from "@/lib/auth";

const OAUTH_FLAG_KEY = "veedu_google_oauth_flag";

async function readJson<T extends Record<string, unknown>>(
  res: Response,
): Promise<T> {
  const text = await res.text();
  if (!text) {
    return { error: `Empty response (HTTP ${res.status})` } as unknown as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return {
      error: text.slice(0, 200) || `HTTP ${res.status}`,
    } as unknown as T;
  }
}

async function accessToken(): Promise<string | null> {
  const client = createSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session?.access_token ?? null;
}

async function apiHeaders(jsonBody: boolean): Promise<HeadersInit> {
  const token = await accessToken();
  const headers: Record<string, string> = {};
  if (jsonBody) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export function GoogleIntegrationsPanel() {
  const { household } = useAuth();
  const qc = useQueryClient();
  const [configured, setConfigured] = useState(true);
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [statusLoaded, setStatusLoaded] = useState(false);
  const bootstrapped = useRef(false);
  const syncing = useRef(false);

  const refresh = useCallback(async () => {
    const headers = await apiHeaders(false);
    const res = await fetch("/api/google/status", {
      headers,
      credentials: "same-origin",
    });
    const json = await readJson<{
      configured?: boolean;
      connected?: boolean;
      googleEmail?: string | null;
      error?: string;
    }>(res);
    // Status returns `configured` even on 401.
    if (typeof json.configured === "boolean") setConfigured(json.configured);
    setConnected(Boolean(json.connected));
    setEmail(json.googleEmail ?? null);
    setStatusLoaded(true);
    return json;
  }, []);

  const runSync = useCallback(async () => {
    if (!household?.id) {
      setMessage("Waiting for household…");
      return false;
    }
    if (syncing.current) return false;
    syncing.current = true;
    setPending(true);
    setMessage("Syncing Google Calendar and Contacts…");
    try {
      const headers = await apiHeaders(true);
      const res = await fetch("/api/google/sync", {
        method: "POST",
        headers,
        credentials: "same-origin",
        body: JSON.stringify({ householdId: household.id }),
      });
      const json = await readJson<{
        error?: string;
        eventsUpserted?: number;
        contactsUpserted?: number;
      }>(res);
      if (!res.ok) {
        setMessage(json.error || `Sync failed (HTTP ${res.status})`);
        return false;
      }
      await qc.invalidateQueries({ queryKey: ["events"] });
      await qc.invalidateQueries({ queryKey: ["contacts"] });
      setMessage(
        `Synced ${json.eventsUpserted ?? 0} events and ${json.contactsUpserted ?? 0} contacts (private). Open Calendar / Contacts to see them.`,
      );
      return true;
    } finally {
      setPending(false);
      syncing.current = false;
    }
  }, [household?.id, qc]);

  // Capture redirect flags once, then always load status.
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const params = new URLSearchParams(window.location.search);
    const flag = params.get("google");
    if (flag === "error") {
      setMessage(params.get("message") || "Google connect failed.");
      sessionStorage.removeItem(OAUTH_FLAG_KEY);
      window.history.replaceState({}, "", "/settings");
    } else if (flag === "pending" || flag === "connected") {
      sessionStorage.setItem(OAUTH_FLAG_KEY, flag);
      window.history.replaceState({}, "", "/settings");
    }

    void (async () => {
      await refresh();

      const oauth = sessionStorage.getItem(OAUTH_FLAG_KEY);
      if (!oauth || oauth === "sync") return;

      setPending(true);
      try {
        if (oauth === "pending") {
          setMessage("Saving Google connection…");
          const headers = await apiHeaders(false);
          const finish = await fetch("/api/google/finish", {
            method: "POST",
            headers,
            credentials: "same-origin",
          });
          const finishJson = await readJson<{ error?: string }>(finish);
          if (!finish.ok) {
            setMessage(
              finishJson.error ||
                `Could not save Google connection (HTTP ${finish.status})`,
            );
            sessionStorage.removeItem(OAUTH_FLAG_KEY);
            return;
          }
        }

        await refresh();
        setConnected(true);

        if (!household?.id) {
          sessionStorage.setItem(OAUTH_FLAG_KEY, "sync");
          setMessage("Google connected. Waiting for household to sync…");
          return;
        }

        sessionStorage.removeItem(OAUTH_FLAG_KEY);
        await runSync();
      } finally {
        setPending(false);
      }
    })();
  }, [household?.id, refresh, runSync]);

  // Deferred sync after finish when household was not ready yet.
  useEffect(() => {
    if (sessionStorage.getItem(OAUTH_FLAG_KEY) !== "sync") return;
    if (!household?.id || syncing.current) return;
    sessionStorage.removeItem(OAUTH_FLAG_KEY);
    void runSync();
  }, [household?.id, runSync]);

  async function connect() {
    setMessage(null);
    const token = await accessToken();
    if (!token) {
      setMessage("You are not signed in. Refresh the page and try again.");
      return;
    }
    if (!configured) {
      setMessage(
        "Google OAuth is not configured on the server. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, then restart Next.js.",
      );
      return;
    }

    setPending(true);
    try {
      const headers = await apiHeaders(false);
      const res = await fetch("/api/google/start", {
        method: "GET",
        headers,
        credentials: "same-origin",
        cache: "no-store",
      });
      const json = await readJson<{ url?: string; error?: string }>(res);
      if (!res.ok || !json.url) {
        setMessage(
          json.error ||
            `Could not start Google OAuth (HTTP ${res.status}). Sign out and back in, then try again.`,
        );
        return;
      }
      sessionStorage.removeItem(OAUTH_FLAG_KEY);
      window.location.assign(json.url);
    } finally {
      setPending(false);
    }
  }

  async function disconnect() {
    setPending(true);
    try {
      const headers = await apiHeaders(false);
      await fetch("/api/google/disconnect", {
        method: "POST",
        headers,
        credentials: "same-origin",
      });
      setConnected(false);
      setEmail(null);
      setMessage("Google disconnected.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted">
        Import Google Calendar events and Contacts into Veedu as{" "}
        <strong className="text-ink">private</strong> rows. After connecting,
        sync runs automatically (or use Sync now anytime). In Google Cloud,
        enable <strong className="text-ink">Google Calendar API</strong> and{" "}
        <strong className="text-ink">People API</strong> for your OAuth client.
      </p>
      {statusLoaded && !configured ? (
        <p className="text-xs text-subtle">
          Set <code className="text-ink">GOOGLE_CLIENT_ID</code> and{" "}
          <code className="text-ink">GOOGLE_CLIENT_SECRET</code> in{" "}
          <code className="text-ink">apps/web/.env.local</code>, then restart
          the server.
        </p>
      ) : null}
      {connected ? (
        <p className="text-ink">
          Connected{email ? ` as ${email}` : ""}.
        </p>
      ) : (
        <p className="text-muted">Not connected.</p>
      )}
      {message ? (
        <p className="text-xs text-subtle" role="status">
          {message}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {!connected ? (
          <Button
            type="button"
            disabled={pending || (statusLoaded && !configured)}
            onClick={() => void connect()}
          >
            {pending ? "Working…" : "Connect Google"}
          </Button>
        ) : (
          <>
            <Button
              type="button"
              disabled={pending || !household}
              onClick={() => void runSync()}
            >
              {pending ? "Working…" : "Sync now"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={() => void disconnect()}
            >
              Disconnect
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
