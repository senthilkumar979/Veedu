"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, CardContent } from "@veedu/ui";
import { useAuth } from "@/lib/auth";
import { bearerAuthHeaders } from "@/lib/auth-headers";

export default function AcceptInvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const { isReady, isAuthenticated } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function accept() {
    setPending(true);
    setMessage(null);
    const headers = await bearerAuthHeaders();
    const res = await fetch("/api/invites/accept", {
      method: "POST",
      headers,
      body: JSON.stringify({ token: params.token }),
    });
    const json = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setMessage(json.error || "Could not accept invite");
      return;
    }
    router.replace("/");
    router.refresh();
  }

  if (!isReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-4 py-8">
          <h1 className="text-xl font-bold text-ink">Household invite</h1>
          {!isAuthenticated ? (
            <>
              <p className="text-sm text-muted">
                Sign in (or create an account with the invited email), then return
                to this link to join the household.
              </p>
              <Button
                className="w-full"
                onClick={() =>
                  router.push(`/login?next=${encodeURIComponent(`/invite/${params.token}`)}`)
                }
              >
                Sign in to continue
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">
                Accept this invite to join the household as a member.
              </p>
              {message ? (
                <p className="text-sm text-danger" role="alert">
                  {message}
                </p>
              ) : null}
              <Button
                className="w-full"
                disabled={pending}
                onClick={() => void accept()}
              >
                {pending ? "Joining…" : "Accept invite"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
