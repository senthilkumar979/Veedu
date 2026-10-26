"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Badge, Card, CardContent } from "@veedu/ui";
import { daysUntil, formatRelativeDue } from "@veedu/domain";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/shared/states";
import { useHouseholdData } from "@/lib/data";

interface DueRow {
  id: string;
  title: string;
  kind: string;
  due: string;
  href: string;
}

export default function DueDatesPage() {
  const { bills, subscriptions, documents, importantDates, tasks } =
    useHouseholdData();

  const rows = useMemo(() => {
    const list: DueRow[] = [];
    for (const b of bills.data ?? []) {
      if (b.status === "paid" || b.archived_at) continue;
      list.push({
        id: `bill-${b.id}`,
        title: b.name,
        kind: "Payment",
        due: b.due_date,
        href: "/payments",
      });
    }
    for (const s of subscriptions.data ?? []) {
      if (s.status !== "active" || s.archived_at) continue;
      list.push({
        id: `sub-${s.id}`,
        title: s.name,
        kind: "Renewal",
        due: s.next_renewal,
        href: "/payments",
      });
    }
    for (const d of documents.data ?? []) {
      if (!d.expires_at || d.archived_at) continue;
      list.push({
        id: `doc-${d.id}`,
        title: d.title,
        kind: "Document expiry",
        due: d.expires_at,
        href: `/documents/${d.id}`,
      });
    }
    for (const i of importantDates.data ?? []) {
      if (i.archived_at) continue;
      list.push({
        id: `date-${i.id}`,
        title: i.title,
        kind: i.category || "Important date",
        due: i.date,
        href: "/important-dates",
      });
    }
    for (const t of tasks.data ?? []) {
      if (!t.due_date || t.status === "done" || t.status === "cancelled")
        continue;
      list.push({
        id: `task-${t.id}`,
        title: t.title,
        kind: "Task",
        due: t.due_date,
        href: "/tasks",
      });
    }
    return list.sort((a, b) => a.due.localeCompare(b.due));
  }, [
    bills.data,
    subscriptions.data,
    documents.data,
    importantDates.data,
    tasks.data,
  ]);

  const loading =
    bills.isLoading ||
    subscriptions.isLoading ||
    documents.isLoading ||
    importantDates.isLoading ||
    tasks.isLoading;

  if (loading)
    return (
      <PageContainer title="Due dates" backHref="/">
        <LoadingBlock />
      </PageContainer>
    );
  if (bills.isError)
    return (
      <PageContainer title="Due dates" backHref="/">
        <ErrorState onRetry={() => void bills.refetch()} />
      </PageContainer>
    );

  return (
    <PageContainer
      title="Due dates"
      description="Renewals, document expiries, and payment deadlines in one list."
      backHref="/"
    >
      {rows.length === 0 ? (
        <EmptyState title="Nothing due" description="You're all clear." />
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => {
            const overdue = daysUntil(row.due) < 0;
            return (
              <li key={row.id}>
                <Link href={row.href}>
                  <Card
                    className={`border-border bg-surface shadow-card transition-colors hover:border-primary/30 hover:bg-primary-soft/60 ${
                      overdue ? "border-l-4 border-l-warning" : ""
                    }`}
                  >
                    <CardContent className="flex items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-ink">
                          {row.title}
                        </p>
                        <p className="text-xs text-muted">{row.kind}</p>
                      </div>
                      <span
                        className={`shrink-0 text-sm font-medium ${
                          overdue ? "text-warning" : "text-primary"
                        }`}
                      >
                        {formatRelativeDue(row.due)}
                      </span>
                      {overdue ? <Badge tone="warning">Overdue</Badge> : null}
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </PageContainer>
  );
}
