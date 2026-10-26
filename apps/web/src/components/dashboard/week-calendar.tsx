"use client";

import Link from "next/link";
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
import { ExpandableSection } from "./expandable-section";

export function WeekCalendar({ events }: { events: CalendarEvent[] }) {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = eachDayOfInterval({
    start,
    end: endOfWeek(start, { weekStartsOn: 1 }),
  });

  return (
    <ExpandableSection
      eyebrow={format(start, "d MMM")}
      title="This week"
      action={
        <Link href="/calendar" className="text-sm font-medium text-primary">
          Calendar
        </Link>
      }
      summary={<WeekStrip days={days} events={events} />}
    >
      <ol className="space-y-6">
        {days.map((day) => {
          const items = eventsForDay(events, day);
          return (
            <li key={day.toISOString()}>
              <p className="text-sm font-semibold text-ink">{format(day, "EEEE d MMM")}</p>
              {items.length === 0 ? (
                <p className="mt-1 text-sm text-muted">Nothing scheduled.</p>
              ) : (
                <ul className="mt-1 space-y-2">
                  {items.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </ExpandableSection>
  );
}

function WeekStrip({
  days,
  events,
}: {
  days: Date[];
  events: CalendarEvent[];
}) {
  return (
    <ol className="flex gap-3 overflow-x-auto pb-1">
      {days.map((day) => {
        const items = eventsForDay(events, day);
        const isToday = isSameDay(day, new Date());
        return (
          <li
            key={day.toISOString()}
            className={cn(
              "min-w-[8.5rem] flex-1 rounded-xl border bg-surface-subtle px-3 py-3",
              isToday ? "border-2 border-primary" : "border-border",
            )}
          >
            <p className="text-xs font-medium text-subtle">{format(day, "EEE")}</p>
            <p className="text-lg font-semibold text-ink">{format(day, "d")}</p>
            {items.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Clear</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {items.slice(0, 2).map((event) => (
                  <li key={event.id} className="truncate text-sm text-ink">
                    {event.title}
                  </li>
                ))}
                {items.length > 2 ? (
                  <li className="text-xs text-muted">+{items.length - 2}</li>
                ) : null}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function EventRow({ event }: { event: CalendarEvent }) {
  const calendar = googleEventCalendarLabel(event.external_id);
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <p className="text-sm font-semibold text-primary">{eventTime(event)}</p>
      <p className="text-sm font-medium text-ink">{event.title}</p>
      {event.location ? <p className="text-xs text-muted">{event.location}</p> : null}
      {event.notes ? <p className="text-xs text-subtle">{event.notes}</p> : null}
      {calendar ? <p className="text-xs text-accent">{calendar}</p> : null}
    </div>
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
