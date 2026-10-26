"use client";

import Link from "next/link";
import { Badge } from "@veedu/ui";
import { formatMoney, formatRelativeDue } from "@veedu/domain";
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
      eyebrow="Due"
      title="Payments"
      action={
        <Link href="/payments" className="text-sm font-medium text-primary">
          All payments
        </Link>
      }
      summary={<PaymentList payments={payments.slice(0, 3)} />}
    >
      <PaymentList payments={payments} detailed />
    </ExpandableSection>
  );
}

function PaymentList({
  payments,
  detailed,
}: {
  payments: PaymentRow[];
  detailed?: boolean;
}) {
  if (payments.length === 0) {
    return <p className="text-sm text-muted">No upcoming payments.</p>;
  }
  return (
    <ul className="space-y-2">
      {payments.map((payment) => (
        <li
          key={payment.id}
          className="flex items-start justify-between gap-3 rounded-lg border border-border px-3 py-2"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{payment.name}</p>
            <p className="text-sm text-muted">{formatRelativeDue(payment.due_date)}</p>
            {detailed ? (
              <p className="text-xs text-subtle">
                {[payment.provider, payment.frequency].filter(Boolean).join(" · ") || "Payment"}
              </p>
            ) : null}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-semibold text-ink">
              {formatMoney(payment.amount, payment.currency)}
            </p>
            {detailed && payment.status ? (
              <Badge
                className="mt-1"
                tone={
                  payment.status === "overdue" || payment.status === "due"
                    ? "warning"
                    : "neutral"
                }
              >
                {payment.status}
              </Badge>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
