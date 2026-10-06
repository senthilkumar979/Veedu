"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Tabs, TabsContent, TabsList, TabsTrigger } from "@veedu/ui";
import { PageContainer } from "@/components/layout/page-container";
import { stubContentGenerator } from "@/features/ai/stub";

export default function ContentPage() {
  const [idea, setIdea] = useState("Calm household operating systems");
  const [out, setOut] = useState(() => stubContentGenerator(idea));

  return (
    <PageContainer title="Content Generator" description="One idea → LinkedIn, Medium, Dev.to variants · stub without API keys">
      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row">
          <Input className="flex-1" value={idea} onChange={(e) => setIdea(e.target.value)} label="Source idea" />
          <Button className="sm:self-end" onClick={() => setOut(stubContentGenerator(idea))}>Generate</Button>
        </CardContent>
      </Card>
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
