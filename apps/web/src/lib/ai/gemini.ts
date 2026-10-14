import {
  stubContentGenerator,
  stubHouseholdAssistant,
  stubTechRadar,
  type AssistantReply,
} from "@/features/ai/stub";

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

async function generateText(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY not set");

  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("")
    .trim();
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

export async function householdAssistant(
  question: string,
): Promise<AssistantReply & { mode: "gemini" | "stub" }> {
  if (!hasGeminiKey()) {
    return { ...stubHouseholdAssistant(question), mode: "stub" };
  }
  try {
    const answer = await generateText(
      `You are Veedu, a calm household command-center assistant. Answer briefly about bills, documents, tasks, subscriptions, and calendar. Stay within household domain. Question: ${question}`,
    );
    return { answer, sources: ["gemini", "household"], mode: "gemini" };
  } catch {
    return { ...stubHouseholdAssistant(question), mode: "stub" };
  }
}

export async function techRadar(): Promise<{
  items: ReturnType<typeof stubTechRadar>;
  mode: "gemini" | "stub";
}> {
  if (!hasGeminiKey()) {
    return { items: stubTechRadar(), mode: "stub" };
  }
  try {
    const text = await generateText(
      `List exactly 3 concise tech radar items for a React/Next.js household-app developer. Return JSON array of {"title","detail"} only, no markdown.`,
    );
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]");
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      const items = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as Array<{
        title: string;
        detail: string;
      }>;
      if (Array.isArray(items) && items.length > 0) {
        return { items: items.slice(0, 5), mode: "gemini" };
      }
    }
  } catch {
    // fall through
  }
  return { items: stubTechRadar(), mode: "stub" };
}

export async function contentGenerator(idea: string): Promise<
  ReturnType<typeof stubContentGenerator> & { mode: "gemini" | "stub" }
> {
  if (!hasGeminiKey()) {
    return { ...stubContentGenerator(idea), mode: "stub" };
  }
  try {
    const text = await generateText(
      `Generate content variants for idea "${idea}". Return JSON only: {"linkedinPost","linkedinArticle","medium","outline":string[]}`,
    );
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as {
        linkedinPost?: string;
        linkedinArticle?: string;
        medium?: string;
        outline?: string[];
      };
      if (parsed.linkedinPost && parsed.medium) {
        return {
          linkedinPost: parsed.linkedinPost,
          linkedinArticle: parsed.linkedinArticle ?? parsed.linkedinPost,
          medium: parsed.medium,
          outline: parsed.outline ?? ["Hook", "Problem", "Solution", "CTA"],
          mode: "gemini",
        };
      }
    }
  } catch {
    // fall through
  }
  return { ...stubContentGenerator(idea), mode: "stub" };
}
