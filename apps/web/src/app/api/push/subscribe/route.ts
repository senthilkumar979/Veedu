import { NextResponse } from "next/server";
import { resolveRequestUser } from "@/lib/push/auth";
import { upsertPushSubscription } from "@/lib/push/subscriptions";
import { getVapidConfig } from "@/lib/push/vapid";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await resolveRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vapid = getVapidConfig();
  if (!vapid.isConfigured) {
    return NextResponse.json(
      {
        error:
          "VAPID keys missing. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.",
      },
      { status: 503 },
    );
  }

  let body: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return NextResponse.json(
      { error: "endpoint and keys.p256dh / keys.auth are required" },
      { status: 400 },
    );
  }

  try {
    const record = await upsertPushSubscription(user.id, {
      endpoint: body.endpoint,
      keys: { p256dh: body.keys.p256dh, auth: body.keys.auth },
    });
    return NextResponse.json({ ok: true, id: record.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Subscribe failed" },
      { status: 500 },
    );
  }
}
