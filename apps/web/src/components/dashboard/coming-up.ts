import { format, parseISO, startOfDay } from "date-fns";
import { daysUntil } from "@veedu/domain";
import type { Document, HomeService, ImportantDate } from "@veedu/types";

export interface ComingUpItem {
  id: string;
  title: string;
  kind: string;
  due: string;
  href: string;
}

const WINDOW_DAYS = 30;

export function buildComingUp(
  dates: ImportantDate[],
  documents: Document[],
  services: HomeService[],
): ComingUpItem[] {
  const items: ComingUpItem[] = [];

  for (const date of dates) {
    if (date.archived_at) continue;
    const due = nextAnnualIso(date.date);
    if (!due || !isUpcoming(due)) continue;
    items.push({
      id: `date-${date.id}`,
      title: date.title,
      kind: date.category || "Important date",
      due,
      href: "/important-dates",
    });
  }

  for (const document of documents) {
    if (document.archived_at || !document.expires_at) continue;
    if (!isDueWithinWindow(document.expires_at)) continue;
    items.push({
      id: `doc-${document.id}`,
      title: document.title,
      kind: "Document expiry",
      due: document.expires_at,
      href: `/documents/${document.id}`,
    });
  }

  for (const service of services) {
    if (service.archived_at || !service.next_due_at) continue;
    if (!isDueWithinWindow(service.next_due_at)) continue;
    items.push({
      id: `service-${service.id}`,
      title: service.name,
      kind: "Home service",
      due: service.next_due_at,
      href: "/home",
    });
  }

  return items.sort((a, b) => a.due.slice(0, 10).localeCompare(b.due.slice(0, 10)));
}

function isUpcoming(dateStr: string): boolean {
  const days = daysUntil(dateStr);
  return days >= 0 && days <= WINDOW_DAYS;
}

function isDueWithinWindow(dateStr: string): boolean {
  return daysUntil(dateStr) <= WINDOW_DAYS;
}

function nextAnnualIso(dateStr: string, from = new Date()): string | null {
  const stored = parseISO(dateStr);
  if (Number.isNaN(stored.getTime())) return null;
  const today = startOfDay(from);
  const month = stored.getMonth();
  const day = stored.getDate();
  for (const year of [today.getFullYear(), today.getFullYear() + 1]) {
    const candidate = annualDate(year, month, day);
    if (candidate >= today) return format(candidate, "yyyy-MM-dd");
  }
  return null;
}

function annualDate(year: number, month: number, day: number): Date {
  const date = new Date(year, month, day);
  if (date.getMonth() !== month) return startOfDay(new Date(year, month, 28));
  return startOfDay(date);
}
