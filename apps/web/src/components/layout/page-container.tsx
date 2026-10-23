"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button, cn } from "@veedu/ui";

interface PageContainerProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  /** When set, shows a Back control that navigates to this href. */
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
  className?: string;
}

export function PageContainer({
  title,
  description,
  actions,
  backHref,
  backLabel = "Back",
  children,
  className,
}: PageContainerProps) {
  const hasHeader = Boolean(title || description || actions);

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-content flex-col px-4 py-4 md:px-5 md:py-4",
        className,
      )}
    >
      {backHref ? (
        <div className="mb-3">
          <Link href={backHref}>
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5 border border-border bg-surface shadow-card"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Button>
          </Link>
        </div>
      ) : null}
      {hasHeader ? (
        <section className="mb-4 rounded-2xl border border-border bg-surface px-5 py-5 shadow-card sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              {title ? (
                <h1 className="text-2xl font-semibold tracking-tight text-ink">
                  {title}
                </h1>
              ) : null}
              {description ? (
                <p className="mt-1 text-sm text-muted">{description}</p>
              ) : null}
            </div>
            {actions ? (
              <div className="flex flex-wrap gap-2">{actions}</div>
            ) : null}
          </div>
        </section>
      ) : null}
      {children}
    </div>
  );
}
