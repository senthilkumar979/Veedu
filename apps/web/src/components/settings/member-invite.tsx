"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Input } from "@veedu/ui";
import { bearerAuthHeaders } from "@/lib/auth-headers";
import { useAuth } from "@/lib/auth";

interface InviteRow {
  id: string;
  email: string;
  status: string;
  created_at: string;
  acceptUrl: string | null;
}

export function MemberInvitePanel() {
  const { profile, household } = useAuth();
  const [email, setEmail] = useState("");
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    if (!household?.id) return;
    const headers = await bearerAuthHeaders();
    const res = await fetch(
      `/api/invites/list?householdId=${encodeURIComponent(household.id)}`,
      { headers },
    );
    if (!res.ok) return;
    const json = (await res.json()) as { invites?: InviteRow[] };
    setInvites(json.invites ?? []);
  }, [household?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createInvite() {
    if (!household?.id || !email.trim()) return;
    setPending(true);
    setMessage(null);
    const headers = await bearerAuthHeaders();
    const res = await fetch("/api/invites/create", {
      method: "POST",
      headers,
      body: JSON.stringify({
        householdId: household.id,
        email: email.trim(),
      }),
    });
    const json = (await res.json()) as {
      error?: string;
      acceptUrl?: string;
    };
    setPending(false);
    if (!res.ok) {
      setMessage(json.error || "Could not create invite");
      return;
    }
    setEmail("");
    setMessage(
      json.acceptUrl
        ? `Invite link ready — copy and send: ${json.acceptUrl}`
        : "Invite created.",
    );
    void load();
  }

  return (
    <div className="space-y-3 text-sm">
      <div>
        <p className="font-medium text-ink">{profile?.full_name}</p>
        <p className="text-muted">{profile?.email}</p>
      </div>
      <Input
        label="Invite by email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="partner@example.com"
      />
      <Button
        type="button"
        disabled={pending || !household || !email.trim()}
        onClick={() => void createInvite()}
      >
        {pending ? "Creating…" : "Create invite link"}
      </Button>
      {message ? (
        <p className="break-all text-xs text-subtle" role="status">
          {message}
        </p>
      ) : null}
      {invites.length > 0 ? (
        <ul className="space-y-2 border-t border-border pt-3">
          {invites.map((inv) => (
            <li key={inv.id} className="text-xs text-muted">
              <span className="text-ink">{inv.email}</span> · {inv.status}
              {inv.acceptUrl ? (
                <button
                  type="button"
                  className="ml-2 underline"
                  onClick={() => void navigator.clipboard.writeText(inv.acceptUrl!)}
                >
                  Copy link
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
