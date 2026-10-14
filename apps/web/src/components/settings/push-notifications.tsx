"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Button } from "@veedu/ui";
import { createSupabaseClient, hasSupabaseEnv } from "@veedu/api";
import { urlBase64ToUint8Array } from "@/lib/push/encoding";

type Status =
  | "idle"
  | "unsupported"
  | "loading"
  | "enabled"
  | "disabled"
  | "error";

async function authHeaders(): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (!hasSupabaseEnv()) {
    headers["x-veedu-demo-user"] = "demo";
    return headers;
  }
  const client = createSupabaseClient();
  if (client) {
    const { data } = await client.auth.getSession();
    if (data.session?.access_token) {
      headers.Authorization = `Bearer ${data.session.access_token}`;
    }
  }
  return headers;
}

export function PushNotificationsPanel() {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string>("");
  const [vapidReady, setVapidReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }

    void (async () => {
      try {
        const keyRes = await fetch("/api/push/vapid-public-key");
        const keyJson = (await keyRes.json()) as {
          configured: boolean;
          publicKey: string | null;
        };
        setVapidReady(Boolean(keyJson.configured && keyJson.publicKey));

        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setStatus(sub ? "enabled" : "disabled");
      } catch {
        setStatus("disabled");
      }
    })();
  }, []);

  const enable = useCallback(async () => {
    setStatus("loading");
    setMessage("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("disabled");
        setMessage("Notification permission denied.");
        return;
      }

      const keyRes = await fetch("/api/push/vapid-public-key");
      const keyJson = (await keyRes.json()) as {
        configured: boolean;
        publicKey: string | null;
      };
      if (!keyJson.configured || !keyJson.publicKey) {
        setStatus("error");
        setMessage("VAPID public key not configured on the server.");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          keyJson.publicKey,
        ) as BufferSource,
      });

      const json = sub.toJSON();
      const headers = await authHeaders();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers,
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error || "Subscribe failed");
      }
      setVapidReady(true);
      setStatus("enabled");
      setMessage("Push notifications enabled.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Failed to enable");
    }
  }, []);

  const disable = useCallback(async () => {
    setStatus("loading");
    setMessage("");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const headers = await authHeaders();
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers,
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("disabled");
      setMessage("Push notifications disabled.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Failed to disable");
    }
  }, []);

  const sendTest = useCallback(async () => {
    setMessage("");
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/push/send-test", {
        method: "POST",
        headers,
        body: JSON.stringify({ force: true }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        skipped?: boolean;
        message?: string;
        error?: string;
        sent?: number;
      };
      if (json.skipped) {
        setMessage(json.message || "Skipped during quiet hours.");
        return;
      }
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Send failed");
      }
      setMessage(`Test sent (${json.sent ?? 0}).`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Test send failed");
    }
  }, []);

  if (status === "unsupported") {
    return (
      <p className="text-sm text-muted">
        Web Push is not supported in this browser.
      </p>
    );
  }

  return (
    <div className="space-y-3 text-sm text-muted">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          tone={
            status === "enabled"
              ? "success"
              : status === "error"
                ? "danger"
                : "neutral"
          }
        >
          {status === "loading" ? "…" : status}
        </Badge>
        {!vapidReady ? (
          <span className="text-xs text-subtle">
            Set VAPID keys in env to enable live push.
          </span>
        ) : null}
      </div>
      <p>
        Bill reminders · Document expiry · Important dates · Task reminders ·
        Subscription renewals · Daily briefing
      </p>
      <p className="text-xs">Quiet hours: 22:00 – 07:00 (best-effort)</p>
      <div className="flex flex-wrap gap-2">
        {status === "enabled" ? (
          <>
            <Button size="sm" variant="secondary" onClick={() => void disable()}>
              Disable
            </Button>
            <Button size="sm" onClick={() => void sendTest()}>
              Send test
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            disabled={status === "loading"}
            onClick={() => void enable()}
          >
            Enable notifications
          </Button>
        )}
      </div>
      {message ? <p className="text-xs text-ink">{message}</p> : null}
    </div>
  );
}
