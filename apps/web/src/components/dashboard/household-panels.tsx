import Link from "next/link";
import { Badge } from "@veedu/ui";
import { formatMoney, formatRelativeDue } from "@veedu/domain";
import type { AttentionItem, Document } from "@veedu/types";
import { EmptyState } from "@/components/shared/states";
import { DashboardPanel } from "./panels";

export interface PaymentRow {
  id: string;
  name: string;
  amount: number;
  currency: string;
  due_date: string;
}

export function PaymentsPanel({
  payments,
  className,
}: {
  payments: PaymentRow[];
  className?: string;
}) {
  return (
    <DashboardPanel title="Payments" href="/payments" action="All" className={className}>
      {payments.length === 0 ? (
        <EmptyState title="No upcoming payments" description="You're all caught up." />
      ) : (
        <ul className="space-y-3">
          {payments.map((payment) => (
            <li key={payment.id} className="flex items-center justify-between gap-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{payment.name}</p>
                <p className="text-xs text-muted">{formatRelativeDue(payment.due_date)}</p>
              </div>
              <p className="shrink-0 font-semibold text-ink">
                {formatMoney(payment.amount, payment.currency)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}

export function DocumentsPanel({
  documents,
  className,
}: {
  documents: Document[];
  className?: string;
}) {
  return (
    <DashboardPanel title="Documents" href="/documents" action="Vault" className={className}>
      <div className="grid gap-2 sm:grid-cols-3">
        {documents.map((doc) => (
          <Link
            key={doc.id}
            href={`/documents/${doc.id}`}
            className="min-h-12 rounded-lg border border-border p-3 hover:bg-surface-hover"
          >
            <p className="text-base font-medium text-ink">{doc.title}</p>
            <p className="mt-1 text-sm text-muted">
              {doc.expires_at ? `Expires ${formatRelativeDue(doc.expires_at)}` : "No expiry"}
            </p>
            <Badge
              className="mt-2"
              tone={
                doc.status === "expired" || doc.status === "expiring_soon"
                  ? "warning"
                  : "success"
              }
            >
              {doc.status.replace("_", " ")}
            </Badge>
          </Link>
        ))}
      </div>
    </DashboardPanel>
  );
}

export function AttentionPanel({
  items,
  className,
}: {
  items: AttentionItem[];
  className?: string;
}) {
  return (
    <DashboardPanel title="Attention" className={className}>
      {items.length === 0 ? (
        <p className="text-sm text-muted">Nothing needs attention.</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex min-h-12 items-center justify-between gap-3 rounded-md px-1 hover:bg-surface-subtle"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">
                    {item.title}
                  </span>
                  <span className="block text-xs text-muted">{item.detail}</span>
                </span>
                <Badge
                  tone={
                    item.priority === "critical" || item.priority === "high"
                      ? "danger"
                      : "neutral"
                  }
                >
                  {item.priority}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}
