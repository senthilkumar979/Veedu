import { NextResponse } from "next/server";
import webpush from "web-push";
import { resolveRequestUser } from "@/lib/push/auth";
import { isQuietHours } from "@/lib/push/quiet-hours";
import { listPushSubscriptions } from "@/lib/push/subscriptions";
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
      { error: "VAPID keys not configured" },
      { status: 503 },
    );
  }

  let force = false;
  let quietEnabled = true;
  let startHour = 22;
  let endHour = 7;
  try {
    const body = (await request.json()) as {
      force?: boolean;
      quiet?: { enabled?: boolean; startHour?: number; endHour?: number };
    };
    force = Boolean(body.force);
    if (body.quiet) {
      quietEnabled = body.quiet.enabled !== false;
      if (typeof body.quiet.startHour === "number")
        startHour = body.quiet.startHour;
      if (typeof body.quiet.endHour === "number") endHour = body.quiet.endHour;
    }
  } catch {
    // empty body is fine
  }

  if (quietEnabled && isQuietHours(new Date(), startHour, endHour) && !force) {
    return NextResponse.json(
      {
        ok: false,
        skipped: true,
        reason: "quiet_hours",
        message: `Quiet hours (${String(startHour).padStart(2, "0")}:00–${String(endHour).padStart(2, "0")}:00). Pass { force: true } to override.`,
      },
      { status: 200 },
    );
  }

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const subs = await listPushSubscriptions(user.id);
  if (subs.length === 0) {
    return NextResponse.json(
      { error: "No push subscriptions for this user" },
      { status: 404 },
    );
  }

  const payload = JSON.stringify({
    title: "Veedu",
    body: "Test notification from Veedu",
    href: "/settings",
  });

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload,
      ),
    ),
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - sent;

  return NextResponse.json({
    ok: sent > 0,
    sent,
    failed,
  });
}
