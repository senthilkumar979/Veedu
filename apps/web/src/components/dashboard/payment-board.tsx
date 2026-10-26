"use client";

import { daysUntil, formatMoney, formatRelativeDue } from "@veedu/domain";
import type { Bill, Subscription } from "@veedu/types";
import { cn } from "@veedu/ui";
import { CardLink, DashboardCard } from "./dashboard-card";

export interface PaymentRow {
  id: string;
  name: string;
  amount: number;
  currency: string;
  due_date: string;
  status?: string;
  frequency?: string;
  provider?: string | null;
}

export function collectUpcomingPayments(bills: Bill[], subscriptions: Subscription[]) {
  return upcomingPayments([
    ...bills.filter((bill) => !bill.archived_at).map((bill) => ({
      id: bill.id,
      name: bill.name,
      amount: bill.amount,
      currency: bill.currency,
      due_date: bill.due_date,
      status: bill.status,
      frequency: bill.frequency,
      provider: bill.provider,
    })),
    ...subscriptions.filter((item) => !item.archived_at).map((item) => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      currency: item.currency,
      due_date: item.next_renewal,
      status: item.status,
      frequency: item.billing_frequency,
      provider: item.provider,
    })),
  ]);
}

export function upcomingPayments(rows: PaymentRow[]) {
  return rows
    .filter((row) => row.status !== "paid" && row.status !== "cancelled" && row.status !== "paused")
    .filter((row) => daysUntil(row.due_date) <= 7)
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
}

export function PaymentBoard({ payments }: { payments: PaymentRow[] }) {
  const preview = payments.slice(0, 4);

  return (
    <DashboardCard
      title="Payments"
      meta="Next 7 days"
      action={<CardLink href="/payments">All</CardLink>}
    >
      {preview.length === 0 ? (
        <p className="py-1 text-sm text-muted">Nothing due this week.</p>
      ) : (
        <ul className="divide-y divide-border">
          {preview.map((payment) => {
            const days = daysUntil(payment.due_date);
            const urgent = days < 0 || payment.status === "overdue" || payment.status === "due";
            return (
              <li key={payment.id} className="flex items-start justify-between gap-3 py-2">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">{payment.name}</span>
                  <span className={cn("block truncate text-xs", urgent ? "text-warning" : "text-muted")}>
                    {days < 0 ? "Overdue · " : days === 0 ? "Today · " : days === 1 ? "Tomorrow · " : ""}
                    {formatRelativeDue(payment.due_date)}
                    {payment.status ? ` · ${payment.status}` : ""}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                  {formatMoney(payment.amount, payment.currency)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardCard>
  );
}
