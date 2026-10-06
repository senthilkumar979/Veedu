"use client";

import { Card, CardContent, CardHeader, CardTitle, Badge } from "@veedu/ui";
import { PageContainer } from "@/components/layout/page-container";
import { stubTechRadar } from "@/features/ai/stub";

export default function TechRadarPage() {
  const items = stubTechRadar();
  return (
    <PageContainer title="Personal Tech Radar" description="Optional intelligence module · React, Next.js, architecture, career">
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s tech radar</CardTitle>
          <Badge tone="primary">{items.length} things worth knowing</Badge>
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
