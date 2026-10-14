import { NextResponse } from "next/server";
import { techRadar } from "@/lib/ai/gemini";

export const dynamic = "force-dynamic";

export async function GET() {
  const out = await techRadar();
  return NextResponse.json(out);
}
