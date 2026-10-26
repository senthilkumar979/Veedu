"use client";

import Link from "next/link";
import { formatRelativeDue } from "@veedu/domain";
import { useHouseholdData } from "@/lib/data";
import { buildComingUp, type ComingUpItem } from "./coming-up";
import { ExpandableSection } from "./expandable-section";

const emptyLabel = "Nothing is due in the next 30 days.";

export function ComingUpBoard() {
  const { importantDates, documents, homeServices } = useHouseholdData();
  const isLoading =
    importantDates.isLoading || documents.isLoading || homeServices.isLoading;
  const hasError =
    importantDates.isError || documents.isError || homeServices.isError;
  const items = buildComingUp(
    importantDates.data ?? [],
    documents.data ?? [],
    homeServices.data ?? [],
  );

  return (
    <ExpandableSection
      eyebrow="Next 30 days"
      title="Coming up"
      summary={
        <ComingUpList
          items={items.slice(0, 3)}
          isLoading={isLoading}
          hasError={hasError}
        />
      }
    >
      <ComingUpList items={items} isLoading={isLoading} hasError={hasError} />
    </ExpandableSection>
  );
}

function ComingUpList({
  items,
  isLoading,
  hasError,
}: {
  items: ComingUpItem[];
  isLoading: boolean;
  hasError: boolean;
}) {
  if (isLoading) return <p className="text-sm text-muted">Loading…</p>;
  if (hasError) return <p className="text-sm text-muted">Coming up is unavailable.</p>;
  if (items.length === 0) return <p className="text-sm text-muted">{emptyLabel}</p>;

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface-subtle px-3 py-3"
          >
            <span className="min-w-0">
              <span className="block text-xs font-semibold uppercase tracking-wide text-subtle">
                {item.kind}
              </span>
              <span className="block truncate text-sm font-medium text-ink">{item.title}</span>
            </span>
            <span className="shrink-0 text-sm text-muted">{formatRelativeDue(item.due)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
