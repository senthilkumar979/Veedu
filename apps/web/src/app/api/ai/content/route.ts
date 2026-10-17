import { NextResponse } from "next/server";
import { contentGenerator } from "@/lib/ai/gemini";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let idea = "";
  try {
    const body = (await request.json()) as { idea?: string };
    idea = body.idea?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const out = await contentGenerator(idea);
  return NextResponse.json(out);
}
