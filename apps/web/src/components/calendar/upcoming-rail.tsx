"use client";

import { addDays, format, isSameDay, parseISO, startOfDay } from "date-fns";
import {
  eventSource,
  eventTimeLabel,
  sourceTone,
} from "@/components/calendar/calendar-utils";
import type { CalendarEvent } from "@veedu/types";

interface UpcomingRailProps {
  events: CalendarEvent[];
  cursor: Date;
  onSelectDay: (day: Date) => void;
}

export function UpcomingRail({
  events,
  cursor,
  onSelectDay,
}: UpcomingRailProps) {
  const start = startOfDay(new Date());
  const end = addDays(start, 14);
  const upcoming = events
    .filter((e) => {
      const at = parseISO(e.start_at);
      return at >= start && at < end;
    })
    .slice(0, 5);

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <header className="mb-3">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-accent">
          Next up
        </p>
        <h2 className="mt-1 text-sm font-semibold text-ink">14-day glance</h2>
      </header>
      {upcoming.length === 0 ? (
        <p className="text-sm text-muted">No events in the next two weeks.</p>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((event) => {
            const tone = sourceTone(eventSource(event));
            const day = parseISO(event.start_at);
            const active = isSameDay(day, cursor);
            return (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => onSelectDay(day)}
                  className={`flex w-full gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    active
                      ? "border-primary/30 bg-primary-soft/50"
                      : "border-border bg-surface-subtle/60 hover:bg-surface-hover"
                  }`}
                >
                  <span
                    className={`mt-1 h-8 w-1 shrink-0 rounded-pill ${tone.bar}`}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold tabular-nums text-primary">
                        {eventTimeLabel(event)}
                      </span>
                      <span className="text-[0.65rem] text-muted">
                        {format(day, "EEE d")}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-medium text-ink">
                      {event.title}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
        <LegendDot className="bg-accent" label="Family" />
        <LegendDot className="bg-primary" label="Primary" />
      </div>
    </section>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-medium text-muted">
      <span className={`h-2 w-2 rounded-full ${className}`} aria-hidden />
      {label}
    </span>
  );
}
