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
        "flex min-h-0 flex-col overflow-hidden rounded-2xl border-2 border-border bg-surface shadow-[0_8px_24px_rgba(41,46,42,0.08)]",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          <button
            type="button"
            className="inline-flex h-12 items-center gap-1 rounded-md border border-border bg-surface px-3 text-sm font-medium text-ink hover:bg-surface-hover"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? "Hide" : "Details"}
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
            />
          </button>
        </div>
      </header>
      <div className="min-h-0 px-4 pb-4">{isOpen ? children : summary}</div>
    </section>
  );
}
