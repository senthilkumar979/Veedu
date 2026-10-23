import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@veedu/api";
import { getGoogleOAuthConfig, GOOGLE_SCOPES } from "@/lib/google/config";
import { verifyOAuthState } from "@/lib/google/oauth-state";
import { exchangeCode, fetchGoogleEmail } from "@/lib/google/tokens";
import { withClearedGoogleCookie } from "@/lib/google/oauth-cookie";
import { setPendingGoogleTokens } from "@/lib/google/pending-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const cfg = getGoogleOAuthConfig();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const err = searchParams.get("error");

  const fail = (msg: string) =>
    withClearedGoogleCookie(
      NextResponse.redirect(
        `${cfg.appUrl}/settings?google=error&message=${encodeURIComponent(msg)}`,
      ),
    );

  if (err) return fail(err);
  if (!code || !state) return fail("Missing OAuth code or state");

  const userId = verifyOAuthState(state);
  if (!userId) return fail("Invalid or expired OAuth state");

  try {
    const tokens = await exchangeCode(code);
    const email = await fetchGoogleEmail(tokens.access_token);
    const pending = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      expires_at: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null,
      scopes: tokens.scope?.split(" ") ?? [...GOOGLE_SCOPES],
      google_email: email,
    };
    const row = {
      user_id: userId,
      google_email: email,
      access_token: pending.access_token,
      refresh_token: pending.refresh_token,
      expires_at: pending.expires_at,
      scopes: pending.scopes,
      updated_at: new Date().toISOString(),
    };

    const admin = createSupabaseServiceClient();
    if (admin) {
      const { error } = await admin
        .from("google_connections")
        .upsert(row, { onConflict: "user_id" });
      if (error) return fail(error.message);
      return withClearedGoogleCookie(
        NextResponse.redirect(`${cfg.appUrl}/settings?google=connected`),
      );
    }

    // No service role: in-memory stash only (never cookie — tokens cause HTTP 431).
    setPendingGoogleTokens(userId, pending);
    return withClearedGoogleCookie(
      NextResponse.redirect(`${cfg.appUrl}/settings?google=pending`),
    );
  } catch (e) {
    return fail(e instanceof Error ? e.message : "OAuth failed");
  }
}
