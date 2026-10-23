import { NextResponse } from "next/server";
import { resolveRequestUser } from "@/lib/push/auth";
import { getGoogleOAuthConfig } from "@/lib/google/config";
import { signOAuthState } from "@/lib/google/oauth-state";
import { googleAuthUrl } from "@/lib/google/tokens";
import { withClearedGoogleCookie } from "@/lib/google/oauth-cookie";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function json(body: Record<string, unknown>, status = 200) {
  return withClearedGoogleCookie(NextResponse.json(body, { status }));
}

export async function GET(request: Request) {
  try {
    const user = await resolveRequestUser(request);
    if (!user) {
      return json(
        { error: "Unauthorized. Refresh the page or sign in again." },
        401,
      );
    }

    const cfg = getGoogleOAuthConfig();
    if (!cfg.isConfigured) {
      return json(
        {
          error:
            "Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, then restart the server.",
        },
        503,
      );
    }

    const state = signOAuthState(user.id);
    const url = googleAuthUrl(state);
    if (!url) {
      return json({ error: "Failed to build Google auth URL" }, 500);
    }
    return json({ url });
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : "OAuth start failed" },
      500,
    );
  }
}
