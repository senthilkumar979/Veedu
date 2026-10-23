"use client";

import Link from "next/link";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import type { CalendarEvent } from "@veedu/types";
import { googleEventCalendarLabel } from "@/lib/google/event-label";

interface CalendarAgendaProps {
  events: CalendarEvent[];
  isSyncing?: boolean;
  calendarsSynced?: string[];
  className?: string;
}

function dayHeading(iso: string): string {
  const d = parseISO(iso);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "EEEE, d MMM");
}

export function CalendarAgenda({
  events,
  isSyncing,
  calendarsSynced,
  className,
}: CalendarAgendaProps) {
  const groups = groupByDay(events);

  return (
    <section
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card animate-dash-in-delay ${className ?? ""}`}
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-accent">
            Family calendar
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
            Coming up
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            {isSyncing
              ? "Syncing Google…"
              : calendarsSynced?.length
                ? `From ${calendarsSynced.join(", ")}`
                : "Synced from Google on load"}
          </p>
        </div>
        <Link
          href="/calendar"
          className="shrink-0 rounded-pill bg-primary-soft px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
        >
          Full calendar
        </Link>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {groups.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-ink">No upcoming events</p>
            <p className="mt-1 max-w-xs text-xs text-muted">
              Connect Google in Settings and keep a calendar named Family — it
              syncs each time you open Dashboard or Calendar.
            </p>
          </div>
        ) : (
          <ol className="space-y-6">
            {groups.map((group) => (
              <li key={group.key}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                  {group.label}
                </p>
                <ul className="relative space-y-0 border-l border-border-strong/60 pl-4">
                  {group.items.map((event) => {
                    const cal = googleEventCalendarLabel(event.external_id);
                    const allDay =
                      event.start_at.endsWith("T00:00:00.000Z") ||
                      !event.start_at.includes("T");
                    return (
                      <li
                        key={event.id}
                        className="relative pb-4 last:pb-0"
                      >
                        <span
                          className="absolute -left-[1.3rem] top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-surface"
                          aria-hidden
                        />
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <time className="text-sm font-semibold tabular-nums text-primary">
                            {allDay
                              ? "All day"
                              : format(parseISO(event.start_at), "HH:mm")}
                          </time>
                          {cal ? (
                            <span className="rounded-pill bg-accent-soft px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-warning">
                              {cal}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-base font-medium text-ink">
                          {event.title}
                        </p>
                        {event.location ? (
                          <p className="mt-0.5 text-xs text-muted">
                            {event.location}
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function groupByDay(events: CalendarEvent[]) {
  const map = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const key = format(parseISO(event.start_at), "yyyy-MM-dd");
    const list = map.get(key) ?? [];
    list.push(event);
    map.set(key, list);
  }
  return [...map.entries()].map(([key, items]) => ({
    key,
    label: dayHeading(items[0]!.start_at),
    items,
  }));
}
