"use client";

import { Suspense, useEffect, useState } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useNavigationProgress } from "@/hooks/use-navigation-progress";

/**
 * Blocking overlay + progress for route changes and React Query activity.
 * Mounted once at the app root (inside QueryClientProvider).
 */
export function GlobalLoaders() {
  return (
    <Suspense fallback={null}>
      <GlobalLoadersInner />
    </Suspense>
  );
}

function GlobalLoadersInner() {
  const navigating = useNavigationProgress();
  const fetching = useIsFetching();
  const mutating = useIsMutating();
  const apiBusy = fetching + mutating > 0;
  const [showApi, setShowApi] = useState(false);

  useEffect(() => {
    if (!apiBusy) {
      setShowApi(false);
      return;
    }
    const timer = window.setTimeout(() => setShowApi(true), 120);
    return () => window.clearTimeout(timer);
  }, [apiBusy]);

  const active = navigating || showApi;

  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      role="alertdialog"
      aria-busy="true"
      aria-live="assertive"
      aria-label="Loading"
    >
      <div className="h-0.5 w-full overflow-hidden bg-primary-soft">
        <div className="h-full w-1/3 rounded-r-full bg-gradient-to-r from-accent via-primary to-accent animate-[veedu-progress_1.1s_ease-in-out_infinite]" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-ink/35 backdrop-blur-[2px]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface shadow-card">
          <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
        </div>
        <p className="rounded-pill bg-surface px-3 py-1 text-xs font-medium text-muted shadow-card">
          {navigating ? "Opening…" : "Working…"}
        </p>
      </div>
    </div>
  );
}
