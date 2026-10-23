"use client";

import { format, isSameDay, isSameMonth, isToday } from "date-fns";
import {
  eventSource,
  eventsOnDay,
  monthDays,
  sourceTone,
} from "@/components/calendar/calendar-utils";
import type { CalendarEvent } from "@veedu/types";

interface MonthBoardProps {
  cursor: Date;
  events: CalendarEvent[];
  onSelectDay: (day: Date) => void;
}

export function MonthBoard({ cursor, events, onSelectDay }: MonthBoardProps) {
  const days = monthDays(cursor);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card animate-dash-in-delay">
      <header className="border-b border-border px-5 py-4">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-accent">
          Month
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
          {format(cursor, "MMMM yyyy")}
        </h2>
      </header>
      <div className="grid grid-cols-7 border-b border-border bg-surface-subtle">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div
            key={d}
            className="px-2 py-2.5 text-center text-[0.65rem] font-semibold uppercase tracking-wide text-subtle"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border">
        {days.map((day) => {
          const dayEvents = eventsOnDay(events, day);
          const inMonth = isSameMonth(day, cursor);
          const selected = isSameDay(day, cursor);
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay(day)}
              className={`flex min-h-[5.5rem] flex-col gap-1 bg-surface p-2 text-left transition-colors sm:min-h-[6.5rem] hover:bg-surface-hover ${
                !inMonth ? "opacity-40" : ""
              } ${selected ? "ring-2 ring-inset ring-primary/50" : ""} ${
                isToday(day) ? "bg-accent-soft/25" : ""
              }`}
            >
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                  isToday(day)
                    ? "bg-primary text-white"
                    : selected
                      ? "bg-primary-soft text-primary"
                      : "text-ink"
                }`}
              >
                {format(day, "d")}
              </span>
              <ul className="hidden flex-1 flex-col gap-0.5 overflow-hidden sm:flex">
                {dayEvents.slice(0, 2).map((event) => {
                  const tone = sourceTone(eventSource(event));
                  return (
                    <li
                      key={event.id}
                      className={`truncate rounded-sm px-1 py-0.5 text-[0.65rem] font-medium ${tone.soft}`}
                    >
                      {event.title}
                    </li>
                  );
                })}
                {dayEvents.length > 2 ? (
                  <li className="text-[0.6rem] text-muted">
                    +{dayEvents.length - 2}
                  </li>
                ) : null}
              </ul>
              {dayEvents.length > 0 ? (
                <span className="mt-auto flex gap-0.5 sm:hidden">
                  {dayEvents.slice(0, 3).map((event) => (
                    <span
                      key={event.id}
                      className={`h-1.5 w-1.5 rounded-full ${
                        sourceTone(eventSource(event)).bar
                      }`}
                    />
                  ))}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
