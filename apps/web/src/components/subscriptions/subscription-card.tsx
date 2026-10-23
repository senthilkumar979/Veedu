"use client";

import { Badge } from "@veedu/ui";
import { formatMoney, formatRelativeDue, daysUntil } from "@veedu/domain";
import type { Subscription } from "@veedu/types";
import { RowActions } from "@/components/shared/row-actions";
import { ServiceLogo } from "@/components/subscriptions/service-logo";

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (s: Subscription) => void;
  onArchive: (id: string) => void;
}

export function SubscriptionCard({
  subscription: s,
  onEdit,
  onArchive,
}: SubscriptionCardProps) {
  const days = daysUntil(s.next_renewal);

  return (
    <li className="rounded-2xl border border-border bg-surface p-4 shadow-card transition hover:border-primary/25">
      <div className="flex items-start gap-3">
        <ServiceLogo name={s.name} provider={s.provider} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{s.name}</p>
              <p className="truncate text-xs text-muted">
                {s.provider || s.category || "Service"}
              </p>
            </div>
            <RowActions
              onEdit={() => onEdit(s)}
              onArchive={() => onArchive(s.id)}
            />
          </div>
          <p className="mt-3 text-lg font-semibold tabular-nums text-ink">
            {formatMoney(s.amount, s.currency)}
            <span className="text-sm font-normal text-muted">
              {" "}
              / {s.billing_frequency}
            </span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={s.status === "active" ? "success" : "neutral"}>
              {s.status}
            </Badge>
            <span
              className={`text-xs ${
                days <= 7 ? "font-medium text-danger" : "text-muted"
              }`}
            >
              Renews {formatRelativeDue(s.next_renewal)}
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}
