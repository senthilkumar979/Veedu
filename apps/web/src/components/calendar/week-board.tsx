"use client";

import { format, isSameDay, isToday } from "date-fns";
import {
  eventSource,
  eventsOnDay,
  eventTimeLabel,
  sourceTone,
  weekDays,
} from "@/components/calendar/calendar-utils";
import type { CalendarEvent } from "@veedu/types";

interface WeekBoardProps {
  cursor: Date;
  events: CalendarEvent[];
  onSelectDay: (day: Date) => void;
}

export function WeekBoard({ cursor, events, onSelectDay }: WeekBoardProps) {
  const days = weekDays(cursor);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card animate-dash-in-delay">
      <header className="border-b border-border px-5 py-4">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-accent">
          Week
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
          {format(days[0]!, "d MMM")} – {format(days[6]!, "d MMM yyyy")}
        </h2>
      </header>
      <div className="grid gap-px bg-border md:grid-cols-7">
        {days.map((day) => {
          const dayEvents = eventsOnDay(events, day);
          const selected = isSameDay(day, cursor);
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay(day)}
              className={`flex min-h-[12rem] flex-col bg-surface p-3 text-left transition-colors hover:bg-surface-hover ${
                selected ? "ring-2 ring-inset ring-primary/40" : ""
              } ${isToday(day) ? "bg-accent-soft/30" : ""}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                    isToday(day)
                      ? "bg-primary text-white"
                      : "text-ink"
                  }`}
                >
                  {format(day, "d")}
                </span>
                <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-subtle">
                  {format(day, "EEE")}
                </span>
              </div>
              <ul className="flex flex-1 flex-col gap-1.5 overflow-hidden">
                {dayEvents.length === 0 ? (
                  <li className="text-xs text-muted">—</li>
                ) : (
                  dayEvents.slice(0, 4).map((event) => {
                    const tone = sourceTone(eventSource(event));
                    return (
                      <li
                        key={event.id}
                        className={`truncate rounded-md border px-1.5 py-1 text-[0.7rem] leading-snug ${tone.chip}`}
                      >
                        <span className="font-semibold tabular-nums">
                          {eventTimeLabel(event)}
                        </span>{" "}
                        {event.title}
                      </li>
                    );
                  })
                )}
                {dayEvents.length > 4 ? (
                  <li className="text-[0.65rem] font-medium text-muted">
                    +{dayEvents.length - 4} more
                  </li>
                ) : null}
              </ul>
            </button>
          );
        })}
      </div>
    </section>
  );
}
