"use client";

import { format, isSameDay, isToday } from "date-fns";
import { MapPin } from "lucide-react";
import {
  agendaRange,
  eventDurationLabel,
  eventSource,
  eventsOnDay,
  eventTimeLabel,
  sourceTone,
} from "@/components/calendar/calendar-utils";
import type { CalendarEvent } from "@veedu/types";

interface AgendaPanelProps {
  cursor: Date;
  events: CalendarEvent[];
  onSelectDay: (day: Date) => void;
}

export function AgendaPanel({ cursor, events, onSelectDay }: AgendaPanelProps) {
  const days = agendaRange(cursor, 7);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card animate-dash-in-delay">
      <header className="border-b border-border px-5 py-4 sm:px-6">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-accent">
          Agenda
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
          Next 7 days
        </h2>
        <p className="mt-0.5 text-sm text-muted">
          From {format(cursor, "d MMM")} · scroll the timeline
        </p>
      </header>

      <div className="divide-y divide-border">
        {days.map((day) => {
          const dayEvents = eventsOnDay(events, day);
          const selected = isSameDay(day, cursor);
          return (
            <div
              key={day.toISOString()}
              className={selected ? "bg-primary-soft/25" : undefined}
            >
              <button
                type="button"
                onClick={() => onSelectDay(day)}
                className="flex w-full items-center gap-4 px-5 py-3 text-left sm:px-6"
              >
                <span
                  className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl ${
                    isToday(day)
                      ? "bg-primary text-white"
                      : selected
                        ? "bg-primary-soft text-primary"
                        : "bg-surface-subtle text-ink"
                  }`}
                >
                  <span className="text-[0.6rem] font-semibold uppercase tracking-wide opacity-80">
                    {format(day, "EEE")}
                  </span>
                  <span className="text-lg font-semibold leading-none">
                    {format(day, "d")}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink">
                    {isToday(day) ? "Today" : format(day, "EEEE, d MMMM")}
                  </span>
                  <span className="text-xs text-muted">
                    {dayEvents.length === 0
                      ? "Open day"
                      : `${dayEvents.length} event${dayEvents.length === 1 ? "" : "s"}`}
                  </span>
                </span>
              </button>

              {dayEvents.length === 0 ? null : (
                <ul className="space-y-2 px-5 pb-4 sm:px-6 sm:pl-[4.75rem]">
                  {dayEvents.map((event) => (
                    <AgendaEvent key={event.id} event={event} />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AgendaEvent({ event }: { event: CalendarEvent }) {
  const tone = sourceTone(eventSource(event));
  const duration = eventDurationLabel(event);

  return (
    <li className="flex gap-3 rounded-xl border border-border bg-surface-subtle/50 p-3 transition-colors hover:border-primary/25 hover:bg-surface">
      <span className={`w-1 shrink-0 rounded-pill ${tone.bar}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <time className="text-sm font-semibold tabular-nums text-primary">
            {eventTimeLabel(event)}
          </time>
          {duration ? (
            <span className="text-xs text-muted">{duration}</span>
          ) : null}
          <span
            className={`rounded-pill border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${tone.chip}`}
          >
            {tone.label}
          </span>
        </div>
        <p className="mt-1 text-base font-medium text-ink">{event.title}</p>
        {event.location ? (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate">{event.location}</span>
          </p>
        ) : null}
      </div>
    </li>
  );
}
