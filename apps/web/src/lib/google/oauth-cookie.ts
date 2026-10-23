import { NextResponse } from "next/server";

/** Legacy cookie name — must be cleared; tokens are too large (HTTP 431). */
export const GOOGLE_OAUTH_COOKIE = "veedu_google_oauth";

export interface PendingGoogleTokens {
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  scopes: string[];
  google_email: string | null;
}

/** Expire the oversized OAuth cookie on every Google API response. */
export function clearPendingGoogleCookie(res: NextResponse) {
  res.cookies.set(GOOGLE_OAUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  // Also clear non-httpOnly variants browsers may have kept.
  res.cookies.set(GOOGLE_OAUTH_COOKIE, "", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function withClearedGoogleCookie(res: NextResponse): NextResponse {
  clearPendingGoogleCookie(res);
  return res;
}
