import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@veedu/ui";

interface DashboardCardProps {
  title: string;
  meta?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DashboardCard({ title, meta, action, children, className }: DashboardCardProps) {
  return (
    <section
      className={cn(
        "flex h-full min-w-0 flex-col rounded-[16px] border border-border bg-surface",
        className,
      )}
    >
      <header className="flex h-11 items-center justify-between gap-2 px-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className="truncate text-sm font-semibold text-ink">{title}</h2>
          {meta ? <p className="truncate text-xs text-muted">{meta}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className="min-w-0 px-3 pb-3">{children}</div>
    </section>
  );
}

export function CardLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center rounded-md px-2 text-xs font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {children}
    </Link>
  );
}
