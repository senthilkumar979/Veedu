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
      title="Calendar"
      action={
        <Link href="/calendar" className="text-xs font-medium text-primary">
          Open
        </Link>
      }
      summary={<WeekGrid days={days} events={events} />}
    >
      <Agenda days={days} events={events} />
    </ExpandableSection>
  );
}

function WeekGrid({ days, events }: { days: Date[]; events: CalendarEvent[] }) {
  return (
    <ol className="grid grid-cols-7 gap-1">
      {days.map((day) => {
        const items = eventsForDay(events, day);
        const today = isSameDay(day, new Date());
        return (
          <li key={day.toISOString()} className="min-w-0">
            <div className="text-center">
              <p className={cn("text-[11px] font-medium uppercase", today ? "text-primary" : "text-subtle")}>
                {format(day, "EEEEE")}
              </p>
              <p
                className={cn(
                  "mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-semibold",
                  today ? "bg-primary text-white" : "text-ink",
                )}
              >
                {format(day, "d")}
              </p>
            </div>
            <ul className="mt-1.5 space-y-1">
              {items.slice(0, 3).map((event) => (
                <li
                  key={event.id}
                  className={cn("truncate rounded px-1 py-0.5 text-[11px] font-medium leading-4", eventTone(event))}
                >
                  {eventTime(event) === "All day" ? event.title : `${eventTime(event)} ${event.title}`}
                </li>
              ))}
              {items.length > 3 ? (
                <li className="px-1 text-[10px] text-muted">+{items.length - 3}</li>
              ) : null}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}

function Agenda({ days, events }: { days: Date[]; events: CalendarEvent[] }) {
  return (
    <ol className="divide-y divide-border">
      {days.map((day) => {
        const items = eventsForDay(events, day);
        const today = isSameDay(day, new Date());
        return (
          <li key={day.toISOString()} className="grid grid-cols-[3.25rem_1fr] gap-3 py-2">
            <div className="text-center">
              <p className={cn("text-[11px] font-medium uppercase", today ? "text-primary" : "text-subtle")}>
                {format(day, "EEE")}
              </p>
              <p
                className={cn(
                  "mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-semibold",
                  today ? "bg-primary text-white" : "text-ink",
                )}
              >
                {format(day, "d")}
              </p>
            </div>
            <div className="min-w-0">
              {items.length === 0 ? <p className="py-1.5 text-xs text-subtle">—</p> : null}
              <ul className="space-y-1">
                {items.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </ul>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function EventRow({ event }: { event: CalendarEvent }) {
  const calendar = googleEventCalendarLabel(event.external_id);
  return (
    <div className={cn("rounded-md px-2 py-1", eventTone(event))}>
      <p className="truncate text-[13px] font-medium">
        <span className="mr-2 font-semibold">{eventTime(event)}</span>
        {event.title}
      </p>
      {event.location || calendar ? (
        <p className="truncate text-[11px] opacity-80">
          {[event.location, calendar].filter(Boolean).join(" · ")}
        </p>
      ) : null}
    </div>
  );
}

function eventTone(event: CalendarEvent) {
  const label = googleEventCalendarLabel(event.external_id);
  if (label === "Family") return "bg-accent-soft text-warning";
  return "bg-primary-soft text-primary";
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
