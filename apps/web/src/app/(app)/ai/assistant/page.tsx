"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@veedu/ui";
import { PageContainer } from "@/components/layout/page-container";
import { stubHouseholdAssistant } from "@/features/ai/stub";

export default function AssistantPage() {
  const [question, setQuestion] = useState("What do we have coming up this week?");
  const [reply, setReply] = useState(() => stubHouseholdAssistant(question));

  return (
    <PageContainer title="Household Assistant" description="Natural-language questions over household data · modular & optional">
      <Card className="mb-4 border-primary/20 bg-primary-soft/30">
        <CardContent className="py-4 text-sm text-ink">
          Stub LLM backend is active. Wire <code>OPENAI_API_KEY</code> or <code>ANTHROPIC_API_KEY</code> later for live responses. Access stays within household domain boundaries.
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Ask Veedu</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input value={question} onChange={(e) => setQuestion(e.target.value)} aria-label="Question" />
          <div className="flex flex-wrap gap-2">
            {["What bills need attention?", "What documents expire in 90 days?", "Plan our weekend"].map((s) => (
              <Button key={s} size="sm" variant="secondary" onClick={() => { setQuestion(s); setReply(stubHouseholdAssistant(s)); }}>{s}</Button>
            ))}
          </div>
          <Button onClick={() => setReply(stubHouseholdAssistant(question))}>Ask</Button>
          <div className="rounded-lg bg-surface-subtle p-4">
            <p className="text-sm text-ink">{reply.answer}</p>
            <p className="mt-2 text-xs text-muted">Sources: {reply.sources.join(", ")}</p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
