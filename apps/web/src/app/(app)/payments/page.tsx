"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardContent,
} from "@veedu/ui";
import {
  advanceDueDate,
  daysUntil,
  formatMoney,
  formatRelativeDue,
} from "@veedu/domain";
import type { Bill, Subscription } from "@veedu/types";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/shared/states";
import { useHouseholdData } from "@/lib/data";

type PayRow =
  | { kind: "bill"; item: Bill; due: string }
  | { kind: "subscription"; item: Subscription; due: string };

export default function PaymentsPage() {
  const {
    bills,
    subscriptions,
    documents,
    updateBill,
    updateSubscription,
  } = useHouseholdData();
  const [busyId, setBusyId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const list: PayRow[] = [];
    for (const b of bills.data ?? []) {
      if (b.archived_at || b.status === "paid") continue;
      list.push({ kind: "bill", item: b, due: b.due_date });
    }
    for (const s of subscriptions.data ?? []) {
      if (s.archived_at || s.status !== "active") continue;
      list.push({ kind: "subscription", item: s, due: s.next_renewal });
    }
    return list.sort((a, b) => a.due.localeCompare(b.due));
  }, [bills.data, subscriptions.data]);

  const docTitle = (id: string | null | undefined) =>
    (documents.data ?? []).find((d) => d.id === id)?.title;

  async function markPaid(row: PayRow) {
    setBusyId(row.item.id);
    try {
      if (row.kind === "bill") {
        const next = advanceDueDate(row.item.due_date, row.item.frequency);
        if (next) {
          await updateBill.mutateAsync({
            id: row.item.id,
            patch: { due_date: next, status: "upcoming" },
          });
        } else {
          await updateBill.mutateAsync({
            id: row.item.id,
            patch: { status: "paid" },
          });
        }
      } else {
        const next = advanceDueDate(
          row.item.next_renewal,
          row.item.billing_frequency,
        );
        if (next) {
          await updateSubscription.mutateAsync({
            id: row.item.id,
            patch: { next_renewal: next },
          });
        }
      }
    } finally {
      setBusyId(null);
    }
  }

  if (bills.isLoading || subscriptions.isLoading)
    return (
      <PageContainer title="Payments" backHref="/">
        <LoadingBlock />
      </PageContainer>
    );
  if (bills.isError || subscriptions.isError)
    return (
      <PageContainer title="Payments" backHref="/">
        <ErrorState onRetry={() => void bills.refetch()} />
      </PageContainer>
    );

  return (
    <PageContainer
      title="Payments"
      description="Upcoming and overdue payments. Mark paid to roll the next due date for recurring items."
      backHref="/"
      actions={
        <>
          <Link href="/bills">
            <Button variant="secondary" size="sm">
              Bills
            </Button>
          </Link>
          <Link href="/subscriptions">
            <Button variant="secondary" size="sm">
              Subscriptions
            </Button>
          </Link>
        </>
      }
    >
      {rows.length === 0 ? (
        <EmptyState
          title="No open payments"
          description="Add a bill or subscription to track due dates."
        />
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => {
            const overdue = daysUntil(row.due) < 0;
            const docId =
              row.kind === "bill" ? row.item.document_id : null;
            const linked = docTitle(docId);
            return (
              <li key={`${row.kind}-${row.item.id}`}>
                <Card
                  className={
                    overdue ? "border-danger/40 bg-danger/5" : undefined
                  }
                >
                  <CardContent className="flex flex-wrap items-center gap-3 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">
                        {row.item.name}
                      </p>
                      <p className="text-xs text-muted">
                        {row.kind === "bill" ? "Bill" : "Subscription"} ·{" "}
                        {formatRelativeDue(row.due)}
                        {linked && docId ? (
                          <>
                            {" · "}
                            <Link
                              href={`/documents/${docId}`}
                              className="underline"
                            >
                              {linked}
                            </Link>
                          </>
                        ) : null}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-ink">
                      {formatMoney(row.item.amount, row.item.currency)}
                    </p>
                    {overdue ? <Badge tone="danger">Overdue</Badge> : null}
                    <Button
                      size="sm"
                      disabled={busyId === row.item.id}
                      onClick={() => void markPaid(row)}
                    >
                      {busyId === row.item.id ? "…" : "Mark paid"}
                    </Button>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </PageContainer>
  );
}
