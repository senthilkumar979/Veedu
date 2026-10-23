import { NextResponse } from "next/server";
import { createSupabaseUserClient } from "@veedu/api";
import { resolveRequestUser } from "@/lib/push/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await resolveRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const householdId = new URL(request.url).searchParams.get("householdId");
  if (!householdId) {
    return NextResponse.json(
      { error: "householdId is required" },
      { status: 400 },
    );
  }

  const client = createSupabaseUserClient(token);
  if (!client) {
    return NextResponse.json({ error: "Supabase unavailable" }, { status: 503 });
  }

  const { data, error } = await client
    .from("household_invites")
    .select("id, email, status, created_at, token")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  return NextResponse.json({
    invites: (data ?? []).map((row) => ({
      ...row,
      acceptUrl:
        row.status === "pending" ? `${appUrl}/invite/${row.token}` : null,
    })),
  });
}
