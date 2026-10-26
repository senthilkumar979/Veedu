"use client";

import Link from "next/link";
import { formatMoney, formatRelativeDue } from "@veedu/domain";
import type { PaymentRow } from "./payment-board";

interface OverviewMetricsProps {
  todayEvents: number;
  openTasks: number;
  overdueTasks: number;
  duePayments: PaymentRow[];
}

export function OverviewMetrics({
  todayEvents,
  openTasks,
  overdueTasks,
  duePayments,
}: OverviewMetricsProps) {
  const nearest = duePayments[0];

  return (
    <nav aria-label="Household overview" className="grid gap-2 sm:grid-cols-3">
      <Metric href="/calendar" label="Today's events" value={String(todayEvents)} detail="On the calendar" />
      <Metric
        href="/payments"
        label="Upcoming payments"
        value={String(duePayments.length)}
        detail={
          nearest
            ? `${formatRelativeDue(nearest.due_date)} · ${formatMoney(nearest.amount, nearest.currency)}`
            : "Nothing due this week"
        }
      />
      <Metric
        href="/tasks"
        label="Outstanding tasks"
        value={String(openTasks)}
        detail={overdueTasks > 0 ? `${overdueTasks} overdue` : "None overdue"}
      />
    </nav>
  );
}

function Metric({
  href,
  label,
  value,
  detail,
}: {
  href: string;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-[16px] border border-border bg-surface px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span className="min-w-0">
        <span className="block truncate text-xs text-muted">{label}</span>
        <span className="block truncate text-xs text-ink">{detail}</span>
      </span>
      <span className="text-xl font-semibold tabular-nums text-ink">{value}</span>
    </Link>
  );
}
