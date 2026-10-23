import { NextResponse } from "next/server";
import {
  createSupabaseServiceClient,
  createSupabaseUserClient,
} from "@veedu/api";
import { resolveRequestUser } from "@/lib/push/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await resolveRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const userClient = token ? createSupabaseUserClient(token) : null;
  const client = createSupabaseServiceClient() ?? userClient;

  if (!client) {
    return NextResponse.json(
      { error: "Supabase client unavailable" },
      { status: 503 },
    );
  }

  const { error } = await client
    .from("google_connections")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
