import { NextResponse } from "next/server";
import { createSupabaseUserClient } from "@veedu/api";
import { resolveRequestUser } from "@/lib/push/auth";
import { withClearedGoogleCookie } from "@/lib/google/oauth-cookie";
import {
  clearPendingGoogleTokens,
  peekPendingGoogleTokens,
} from "@/lib/google/pending-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function json(body: Record<string, unknown>, status = 200) {
  return withClearedGoogleCookie(NextResponse.json(body, { status }));
}

export async function POST(request: Request) {
  try {
    const user = await resolveRequestUser(request);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const auth = request.headers.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return json({ error: "Unauthorized" }, 401);

    const pending = peekPendingGoogleTokens(user.id);
    if (!pending?.access_token) {
      return json(
        {
          error:
            "No pending Google connection. Connect Google again (do not use an oversized cookie).",
        },
        400,
      );
    }

    const client = createSupabaseUserClient(token);
    if (!client) return json({ error: "Supabase unavailable" }, 503);

    const { error } = await client.from("google_connections").upsert(
      {
        user_id: user.id,
        google_email: pending.google_email,
        access_token: pending.access_token,
        refresh_token: pending.refresh_token,
        expires_at: pending.expires_at,
        scopes: pending.scopes ?? [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      return json(
        {
          error: error.message.includes("does not exist")
            ? "Run Supabase migration 20261022210000_google_invites_external.sql first."
            : error.message,
        },
        400,
      );
    }

    clearPendingGoogleTokens(user.id);
    return json({ ok: true, googleEmail: pending.google_email });
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : "Finish failed" },
      500,
    );
  }
}
