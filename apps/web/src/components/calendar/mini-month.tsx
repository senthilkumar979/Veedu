"use client";

import { format, isSameDay, isSameMonth, isToday } from "date-fns";
import {
  eventsOnDay,
  monthDays,
} from "@/components/calendar/calendar-utils";
import type { CalendarEvent } from "@veedu/types";

interface MiniMonthProps {
  cursor: Date;
  events: CalendarEvent[];
  onSelectDay: (day: Date) => void;
}

export function MiniMonth({ cursor, events, onSelectDay }: MiniMonthProps) {
  const days = monthDays(cursor);

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <header className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-ink">
          {format(cursor, "MMMM yyyy")}
        </h2>
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-subtle">
          Jump
        </span>
      </header>
      <div className="grid grid-cols-7 gap-1 text-center text-[0.65rem] font-semibold uppercase tracking-wide text-subtle">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className="py-1">
            {d}
          </span>
        ))}
      </div>
      <div className="mt-0.5 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const count = eventsOnDay(events, day).length;
          const selected = isSameDay(day, cursor);
          const inMonth = isSameMonth(day, cursor);
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay(day)}
              className={`relative flex h-9 items-center justify-center rounded-lg text-sm transition-all duration-200 ${
                selected
                  ? "bg-primary font-semibold text-white shadow-card scale-[1.04]"
                  : isToday(day)
                    ? "bg-accent-soft font-semibold text-ink ring-1 ring-accent/40"
                    : inMonth
                      ? "text-ink hover:bg-surface-hover"
                      : "text-disabled"
              }`}
              aria-label={format(day, "d MMMM")}
              aria-pressed={selected}
            >
              {format(day, "d")}
              {count > 0 && !selected ? (
                <span className="absolute bottom-0.5 left-1/2 flex -translate-x-1/2 gap-0.5">
                  {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                    <span
                      key={i}
                      className="h-1 w-1 rounded-full bg-accent"
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
