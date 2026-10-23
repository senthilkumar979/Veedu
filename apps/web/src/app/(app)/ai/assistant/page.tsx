"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@veedu/ui";
import { PageContainer } from "@/components/layout/page-container";
import { stubHouseholdAssistant, type AssistantReply } from "@/features/ai/stub";

export default function AssistantPage() {
  const [question, setQuestion] = useState("What do we have coming up this week?");
  const [reply, setReply] = useState<AssistantReply & { mode?: string }>(() => ({
    ...stubHouseholdAssistant(question),
    mode: "stub",
  }));
  const [busy, setBusy] = useState(false);

  async function ask(q: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = (await res.json()) as AssistantReply & { mode?: string };
      setReply(data);
    } catch {
      setReply({ ...stubHouseholdAssistant(q), mode: "stub" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer title="Household Assistant" description="Natural-language questions over household data · modular & optional" backHref="/more">
      <Card className="mb-4 border-primary/20 bg-primary-soft/30">
        <CardContent className="py-4 text-sm text-ink">
          {reply.mode === "gemini" ? (
            <>Live Gemini responses are active.</>
          ) : (
            <>
              Stub mode is active. Set <code>GEMINI_API_KEY</code> for live responses. Access stays within household domain boundaries.
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Ask Velan Illam</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input value={question} onChange={(e) => setQuestion(e.target.value)} aria-label="Question" />
          <div className="flex flex-wrap gap-2">
            {["What bills need attention?", "What documents expire in 90 days?", "Plan our weekend"].map((s) => (
              <Button
                key={s}
                size="sm"
                variant="secondary"
                disabled={busy}
                onClick={() => {
                  setQuestion(s);
                  void ask(s);
                }}
              >
                {s}
              </Button>
            ))}
          </div>
          <Button disabled={busy} onClick={() => void ask(question)}>
            {busy ? "Thinking…" : "Ask"}
          </Button>
          <div className="rounded-lg bg-surface-subtle p-4">
            <p className="text-sm text-ink">{reply.answer}</p>
            <p className="mt-2 text-xs text-muted">Sources: {reply.sources.join(", ")}</p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
