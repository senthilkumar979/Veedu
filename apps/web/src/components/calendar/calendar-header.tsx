"use client";

import { format } from "date-fns";
import { Button } from "@veedu/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarView } from "@/components/calendar/calendar-utils";

interface CalendarHeaderProps {
  cursor: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onStep: (direction: -1 | 1) => void;
  onToday: () => void;
  todayCount: number;
  weekCount: number;
  syncHint: string;
}

const VIEWS: { id: CalendarView; label: string }[] = [
  { id: "agenda", label: "Agenda" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

export function CalendarHeader({
  cursor,
  view,
  onViewChange,
  onStep,
  onToday,
  todayCount,
  weekCount,
  syncHint,
}: CalendarHeaderProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card animate-dash-in">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-[#355747] to-[#1f3329] px-5 py-6 text-white sm:px-7">
        <div
          className="pointer-events-none absolute -right-16 -top-10 h-48 w-48 rounded-full bg-accent/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/65">
              Family calendar
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {format(cursor, "EEEE")}
              <span className="mt-1 block text-xl font-medium text-white/85 sm:text-2xl">
                {format(cursor, "d MMMM yyyy")}
              </span>
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/75">{syncHint}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatPill label="Today" value={String(todayCount)} />
              <StatPill label="This week" value={String(weekCount)} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="h-11 border-0 bg-white/12 text-white hover:bg-white/22"
              onClick={() => onStep(-1)}
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-11 border-0 bg-white text-primary hover:bg-accent-soft"
              onClick={onToday}
            >
              Today
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-11 border-0 bg-white/12 text-white hover:bg-white/22"
              onClick={() => onStep(1)}
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5">
        <div
          className="inline-flex rounded-xl bg-surface-subtle p-1"
          role="tablist"
          aria-label="Calendar view"
        >
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={view === v.id}
              onClick={() => onViewChange(v.id)}
              className={`min-h-10 rounded-lg px-4 text-sm font-medium transition-colors ${
                view === v.id
                  ? "bg-surface text-primary shadow-card"
                  : "text-muted hover:text-ink"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">{format(cursor, "MMMM yyyy")}</p>
      </div>
    </section>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-pill bg-white/12 px-3 py-1.5 text-xs backdrop-blur-sm">
      <span className="font-semibold tabular-nums text-white">{value}</span>
      <span className="text-white/70">{label}</span>
    </span>
  );
}
