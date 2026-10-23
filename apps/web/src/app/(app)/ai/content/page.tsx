"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, Input, Tabs, TabsContent, TabsList, TabsTrigger } from "@veedu/ui";
import { PageContainer } from "@/components/layout/page-container";
import { stubContentGenerator } from "@/features/ai/stub";

type ContentOut = ReturnType<typeof stubContentGenerator> & { mode?: string };

export default function ContentPage() {
  const [idea, setIdea] = useState("Calm household operating systems");
  const [out, setOut] = useState<ContentOut>(() => ({
    ...stubContentGenerator(idea),
    mode: "stub",
  }));
  const [busy, setBusy] = useState(false);

  async function generate() {
    setBusy(true);
    try {
      const res = await fetch("/api/ai/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      if (!res.ok) throw new Error("Request failed");
      setOut((await res.json()) as ContentOut);
    } catch {
      setOut({ ...stubContentGenerator(idea), mode: "stub" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer title="Content Generator" description="One idea → LinkedIn, Medium, Dev.to variants · Gemini when keyed, else stub" backHref="/more">
      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row">
          <Input className="flex-1" value={idea} onChange={(e) => setIdea(e.target.value)} label="Source idea" />
          <Button className="sm:self-end" disabled={busy} onClick={() => void generate()}>
            {busy ? "Generating…" : "Generate"}
          </Button>
        </CardContent>
      </Card>
      {out.mode ? (
        <p className="mb-3 text-xs text-subtle">Mode: {out.mode}</p>
      ) : null}
      <Tabs defaultValue="linkedin">
        <TabsList>
          <TabsTrigger value="linkedin">LinkedIn post</TabsTrigger>
          <TabsTrigger value="article">LinkedIn article</TabsTrigger>
          <TabsTrigger value="medium">Medium / Dev.to</TabsTrigger>
          <TabsTrigger value="outline">Outline</TabsTrigger>
        </TabsList>
        <TabsContent value="linkedin"><Card><CardContent className="whitespace-pre-wrap py-4 text-sm">{out.linkedinPost}</CardContent></Card></TabsContent>
        <TabsContent value="article"><Card><CardContent className="whitespace-pre-wrap py-4 text-sm">{out.linkedinArticle}</CardContent></Card></TabsContent>
        <TabsContent value="medium"><Card><CardContent className="whitespace-pre-wrap py-4 text-sm">{out.medium}</CardContent></Card></TabsContent>
        <TabsContent value="outline"><Card><CardContent className="py-4"><ol className="list-decimal space-y-1 pl-5 text-sm">{out.outline.map((x) => <li key={x}>{x}</li>)}</ol></CardContent></Card></TabsContent>
      </Tabs>
    </PageContainer>
  );
}
