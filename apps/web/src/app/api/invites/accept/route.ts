import { NextResponse } from "next/server";
import { createSupabaseServiceClient, createSupabaseUserClient } from "@veedu/api";
import { resolveRequestUser } from "@/lib/push/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await resolveRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth = request.headers.get("authorization");
  const accessToken = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { token?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const admin = createSupabaseServiceClient();
  const userClient = createSupabaseUserClient(accessToken);
  if (!admin || !userClient) {
    return NextResponse.json({ error: "Supabase unavailable" }, { status: 503 });
  }

  const { data: invite, error } = await admin
    .from("household_invites")
    .select("*")
    .eq("token", body.token)
    .eq("status", "pending")
    .maybeSingle();

  if (error || !invite) {
    return NextResponse.json(
      { error: "Invite not found or already used" },
      { status: 404 },
    );
  }

  const { data: profile } = await userClient
    .from("profiles")
    .select("id, email, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (
    profile?.email &&
    invite.email &&
    profile.email.toLowerCase() !== invite.email.toLowerCase()
  ) {
    return NextResponse.json(
      {
        error: `Sign in as ${invite.email} to accept this invite (current: ${profile.email}).`,
      },
      { status: 403 },
    );
  }

  const { error: memberError } = await admin.from("household_members").upsert(
    {
      household_id: invite.household_id,
      user_id: user.id,
      role: "member",
      status: "active",
      display_name: profile?.full_name || profile?.email || "Member",
    },
    { onConflict: "household_id,user_id" },
  );

  if (memberError) {
    // Fallback insert if no unique constraint name
    const { error: insertErr } = await admin.from("household_members").insert({
      household_id: invite.household_id,
      user_id: user.id,
      role: "member",
      status: "active",
      display_name: profile?.full_name || profile?.email || "Member",
    });
    if (insertErr && !insertErr.message.includes("duplicate")) {
      return NextResponse.json({ error: insertErr.message }, { status: 400 });
    }
  }

  await admin
    .from("household_invites")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
      accepted_by: user.id,
    })
    .eq("id", invite.id);

  return NextResponse.json({ ok: true, householdId: invite.household_id });
}
