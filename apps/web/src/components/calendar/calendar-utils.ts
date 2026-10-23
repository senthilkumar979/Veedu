import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  isTomorrow,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { CalendarEvent } from "@veedu/types";
import { googleEventCalendarLabel } from "@/lib/google/event-label";

export type CalendarView = "agenda" | "week" | "month";

export const WEEK_OPTS = { weekStartsOn: 1 as const };

export function monthDays(cursor: Date) {
  return eachDayOfInterval({
    start: startOfWeek(startOfMonth(cursor), WEEK_OPTS),
    end: endOfWeek(endOfMonth(cursor), WEEK_OPTS),
  });
}

export function weekDays(cursor: Date) {
  return eachDayOfInterval({
    start: startOfWeek(cursor, WEEK_OPTS),
    end: endOfWeek(cursor, WEEK_OPTS),
  });
}

export function eventsOnDay(events: CalendarEvent[], day: Date) {
  return events.filter((e) => isSameDay(parseISO(e.start_at), day));
}

export function isAllDay(event: CalendarEvent) {
  return (
    !event.start_at.includes("T") ||
    event.start_at.endsWith("T00:00:00.000Z") ||
    event.start_at.endsWith("T00:00:00Z")
  );
}

export function eventTimeLabel(event: CalendarEvent) {
  if (isAllDay(event)) return "All day";
  return format(parseISO(event.start_at), "HH:mm");
}

export function eventDurationLabel(event: CalendarEvent) {
  if (isAllDay(event)) return null;
  const start = parseISO(event.start_at);
  const end = parseISO(event.end_at);
  const mins = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export type EventSource = "family" | "primary" | "other";

export function eventSource(event: CalendarEvent): EventSource {
  const label = googleEventCalendarLabel(event.external_id);
  if (label === "Family") return "family";
  if (label === "Primary") return "primary";
  return "other";
}

export function sourceTone(source: EventSource) {
  if (source === "family")
    return {
      bar: "bg-accent",
      soft: "bg-accent-soft text-warning",
      chip: "bg-accent-soft border-accent/30 text-warning",
      label: "Family",
    };
  if (source === "primary")
    return {
      bar: "bg-primary",
      soft: "bg-primary-soft text-primary",
      chip: "bg-primary-soft border-primary/25 text-primary",
      label: "Primary",
    };
  return {
    bar: "bg-border-strong",
    soft: "bg-surface-subtle text-muted",
    chip: "bg-surface-subtle border-border text-muted",
    label: "Event",
  };
}

export function dayHeading(iso: string) {
  const d = parseISO(iso);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "EEEE, d MMM");
}

export function agendaRange(cursor: Date, days = 7) {
  return eachDayOfInterval({
    start: cursor,
    end: addDays(cursor, days - 1),
  });
}

export function countInRange(events: CalendarEvent[], start: Date, end: Date) {
  return events.filter((e) => {
    const at = parseISO(e.start_at);
    return at >= start && at < end;
  }).length;
}
