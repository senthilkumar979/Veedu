"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@veedu/ui";

interface ExpandableSectionProps {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  summary: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ExpandableSection({
  title,
  eyebrow,
  action,
  summary,
  children,
  className,
}: ExpandableSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card",
        className,
      )}
    >
      <header className="flex h-11 items-center justify-between gap-2 px-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className="truncate text-sm font-semibold text-ink">{title}</h2>
          {eyebrow ? <p className="truncate text-xs text-muted">{eyebrow}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {action}
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-subtle"
            aria-expanded={isOpen}
            aria-label={isOpen ? `Hide ${title}` : `Show ${title}`}
            onClick={() => setIsOpen((open) => !open)}
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
          </button>
        </div>
      </header>
      <div className="min-h-0 px-3 pb-3">{isOpen ? children : summary}</div>
    </section>
  );
}
