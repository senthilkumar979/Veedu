"use client";

import Link from "next/link";
import { formatMoney, formatRelativeDue } from "@veedu/domain";
import { cn } from "@veedu/ui";
import { ExpandableSection } from "./expandable-section";

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

export function PaymentBoard({ payments }: { payments: PaymentRow[] }) {
  return (
    <ExpandableSection
      title="Payments"
      action={
        <Link href="/payments" className="text-xs font-medium text-primary">
          All
        </Link>
      }
      summary={<PaymentList payments={payments.slice(0, 4)} />}
    >
      <PaymentList payments={payments} detailed />
    </ExpandableSection>
  );
}

function PaymentList({ payments, detailed }: { payments: PaymentRow[]; detailed?: boolean }) {
  if (payments.length === 0) return <p className="py-2 text-sm text-muted">No upcoming payments.</p>;
  return (
    <ul className="divide-y divide-border">
      {payments.map((payment) => {
        const dueNow = payment.status === "overdue" || payment.status === "due";
        return (
          <li key={payment.id} className="flex items-start justify-between gap-3 py-2">
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-ink">{payment.name}</span>
              <span className={cn("block truncate text-xs", dueNow ? "text-warning" : "text-muted")}>
                {formatRelativeDue(payment.due_date)}
                {detailed && payment.status ? ` · ${payment.status}` : ""}
                {detailed && (payment.provider || payment.frequency)
                  ? ` · ${[payment.provider, payment.frequency].filter(Boolean).join(" · ")}`
                  : ""}
              </span>
            </span>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
              {formatMoney(payment.amount, payment.currency)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
