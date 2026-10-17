import { NextResponse } from "next/server";
import { getVapidConfig } from "@/lib/push/vapid";

export const dynamic = "force-dynamic";

/** Expose the public VAPID key for client subscription. */
export async function GET() {
  const { publicKey, isConfigured } = getVapidConfig();
  if (!isConfigured || !publicKey) {
    return NextResponse.json(
      { configured: false, publicKey: null },
      { status: 200 },
    );
  }
  return NextResponse.json({ configured: true, publicKey });
}
