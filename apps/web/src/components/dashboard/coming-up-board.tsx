"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { formatRelativeDue } from "@veedu/domain";
import { useHouseholdData } from "@/lib/data";
import { buildComingUp, type ComingUpItem } from "./coming-up";
import { ExpandableSection } from "./expandable-section";

const emptyLabel = "Nothing in the next 30 days.";

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
      eyebrow="30 days"
      title="Coming up"
      summary={<ComingUpList items={items.slice(0, 4)} isLoading={isLoading} hasError={hasError} />}
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
  if (isLoading) return <p className="py-2 text-sm text-muted">Loading…</p>;
  if (hasError) return <p className="py-2 text-sm text-muted">Coming up is unavailable.</p>;
  if (items.length === 0) return <p className="py-2 text-sm text-muted">{emptyLabel}</p>;

  return (
    <ul className="divide-y divide-border">
      {items.map((item) => (
        <li key={item.id}>
          <Link href={item.href} className="flex items-center gap-3 py-2">
            <DateMark due={item.due} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink">{item.title}</span>
              <span className="block truncate text-xs text-muted">
                {item.kind} · {formatRelativeDue(item.due)}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function DateMark({ due }: { due: string }) {
  const date = parseISO(due);
  if (Number.isNaN(date.getTime())) return null;
  return (
    <span className="w-9 shrink-0 text-center">
      <span className="block text-[10px] font-semibold uppercase tracking-wide text-primary">
        {format(date, "MMM")}
      </span>
      <span className="block text-base font-semibold leading-none text-ink">{format(date, "d")}</span>
    </span>
  );
}
