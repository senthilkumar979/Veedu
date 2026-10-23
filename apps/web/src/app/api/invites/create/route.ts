import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createSupabaseUserClient } from "@veedu/api";
import { resolveRequestUser } from "@/lib/push/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await resolveRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { householdId?: string; email?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!body.householdId || !email) {
    return NextResponse.json(
      { error: "householdId and email are required" },
      { status: 400 },
    );
  }

  const client = createSupabaseUserClient(token);
  if (!client) {
    return NextResponse.json({ error: "Supabase unavailable" }, { status: 503 });
  }

  const inviteToken = randomBytes(24).toString("hex");
  const { data, error } = await client
    .from("household_invites")
    .insert({
      household_id: body.householdId,
      email,
      token: inviteToken,
      invited_by: user.id,
      status: "pending",
    })
    .select("id, token, email, status, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  return NextResponse.json({
    ok: true,
    invite: data,
    acceptUrl: `${appUrl}/invite/${data.token}`,
  });
}
