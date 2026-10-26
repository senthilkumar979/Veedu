"use client";

import { useState } from "react";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfWeek,
} from "date-fns";
import { cn } from "@veedu/ui";
import type { CalendarEvent } from "@veedu/types";
import { googleEventCalendarLabel } from "@/lib/google/event-label";
import { CardLink, DashboardCard } from "./dashboard-card";

export function WeekCalendar({ events }: { events: CalendarEvent[] }) {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end: endOfWeek(start, { weekStartsOn: 1 }) });
  const [selected, setSelected] = useState(() => new Date());
  const items = eventsForDay(events, selected);

  return (
    <DashboardCard
      title="Agenda"
      meta={format(selected, "EEE d MMM")}
      action={<CardLink href="/calendar">Open calendar</CardLink>}
    >
      <ol className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const active = isSameDay(day, selected);
          const today = isSameDay(day, new Date());
          const count = eventsForDay(events, day).length;
          return (
            <li key={day.toISOString()}>
              <button
                type="button"
                aria-pressed={active}
                aria-label={format(day, "EEEE d MMMM")}
                onClick={() => setSelected(day)}
                className="flex w-full flex-col items-center rounded-md py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className={cn("text-[11px] font-medium uppercase", today ? "text-primary" : "text-muted")}>
                  {format(day, "EEEEE")}
                </span>
                <span
                  className={cn(
                    "mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-semibold",
                    active ? "bg-primary text-white" : "text-ink",
                  )}
                >
                  {format(day, "d")}
                </span>
                <span
                  className={cn(
                    "mt-1 h-1 w-1 rounded-full bg-accent",
                    count === 0 && "invisible",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ol>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Nothing scheduled.</p>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {items.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}

function EventRow({ event }: { event: CalendarEvent }) {
  const calendar = googleEventCalendarLabel(event.external_id);
  return (
    <li className="flex items-start gap-3 py-2">
      <span className="w-14 shrink-0 text-xs font-medium text-primary">{eventTime(event)}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-ink">{event.title}</span>
        {event.location || calendar ? (
          <span className="block truncate text-xs text-muted">
            {[calendar, event.location].filter(Boolean).join(" · ")}
          </span>
        ) : null}
      </span>
    </li>
  );
}

function eventsForDay(events: CalendarEvent[], day: Date) {
  return events
    .filter((event) => isSameDay(parseISO(event.start_at), day))
    .sort((a, b) => a.start_at.localeCompare(b.start_at));
}

function eventTime(event: CalendarEvent) {
  const allDay = !event.start_at.includes("T") || event.start_at.endsWith("T00:00:00.000Z");
  if (allDay) return "All day";
  return format(parseISO(event.start_at), "HH:mm");
}
