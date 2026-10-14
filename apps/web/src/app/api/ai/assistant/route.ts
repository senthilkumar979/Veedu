import { NextResponse } from "next/server";
import { householdAssistant } from "@/lib/ai/gemini";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let question = "";
  try {
    const body = (await request.json()) as { question?: string };
    question = body.question?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!question) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  const reply = await householdAssistant(question);
  return NextResponse.json(reply);
}
