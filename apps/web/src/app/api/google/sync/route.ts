import { NextResponse } from "next/server";
import {
  createSupabaseServiceClient,
  createSupabaseUserClient,
} from "@veedu/api";
import { resolveRequestUser } from "@/lib/push/auth";
import { getGoogleOAuthConfig } from "@/lib/google/config";
import { syncGoogleIntoHousehold } from "@/lib/google/sync";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await resolveRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!getGoogleOAuthConfig().isConfigured) {
    return NextResponse.json(
      { error: "Google OAuth not configured" },
      { status: 503 },
    );
  }

  let body: { householdId?: string } = {};
  try {
    body = await request.json();
  } catch {
    /* empty */
  }
  if (!body.householdId) {
    return NextResponse.json(
      { error: "householdId is required" },
      { status: 400 },
    );
  }

  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userClient = createSupabaseUserClient(token);
  const admin = createSupabaseServiceClient() ?? userClient;
  if (!admin || !userClient) {
    return NextResponse.json(
      { error: "Supabase client unavailable" },
      { status: 503 },
    );
  }

  try {
    const result = await syncGoogleIntoHousehold(
      admin,
      userClient,
      user.id,
      body.householdId,
    );
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sync failed" },
      { status: 500 },
    );
  }
}
