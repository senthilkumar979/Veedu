import { NextResponse } from "next/server";
import {
  createSupabaseServiceClient,
  createSupabaseUserClient,
} from "@veedu/api";
import { resolveRequestUser } from "@/lib/push/auth";
import { getGoogleOAuthConfig } from "@/lib/google/config";
import { withClearedGoogleCookie } from "@/lib/google/oauth-cookie";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const configured = getGoogleOAuthConfig().isConfigured;
  const user = await resolveRequestUser(request);
  if (!user) {
    return withClearedGoogleCookie(
      NextResponse.json({ configured, connected: false }, { status: 401 }),
    );
  }

  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const userClient = token ? createSupabaseUserClient(token) : null;
  const admin = createSupabaseServiceClient();
  const client = userClient ?? admin;

  if (!client) {
    return withClearedGoogleCookie(
      NextResponse.json({
        configured,
        connected: false,
        googleEmail: null,
      }),
    );
  }

  const { data } = await client
    .from("google_connections")
    .select("google_email, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return withClearedGoogleCookie(
    NextResponse.json({
      configured,
      connected: Boolean(data),
      googleEmail: data?.google_email ?? null,
      updatedAt: data?.updated_at ?? null,
    }),
  );
}
