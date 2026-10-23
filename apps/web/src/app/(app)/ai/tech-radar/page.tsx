"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@veedu/ui";
import { PageContainer } from "@/components/layout/page-container";
import { stubTechRadar } from "@/features/ai/stub";

export default function TechRadarPage() {
  const [items, setItems] = useState(stubTechRadar());
  const [mode, setMode] = useState<"stub" | "gemini">("stub");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/ai/tech-radar");
        if (!res.ok) return;
        const data = (await res.json()) as {
          items: ReturnType<typeof stubTechRadar>;
          mode: "stub" | "gemini";
        };
        if (!cancelled) {
          setItems(data.items);
          setMode(data.mode);
        }
      } catch {
        // keep stub
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageContainer title="Personal Tech Radar" description="Optional intelligence module · React, Next.js, architecture, career" backHref="/more">
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s tech radar</CardTitle>
          <Badge tone="primary">{mode} · {items.length} things worth knowing</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item, i) => (
            <div key={item.title} className="rounded-lg border border-border p-4">
              <p className="text-sm font-semibold text-ink">{i + 1}. {item.title}</p>
              <p className="mt-1 text-sm text-muted">{item.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
