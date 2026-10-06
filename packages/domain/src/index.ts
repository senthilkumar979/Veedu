import { z } from "zod";
import {
  differenceInCalendarDays,
  format,
  isBefore,
  isToday,
  isTomorrow,
  parseISO,
  startOfDay,
} from "date-fns";
import type {
  AttentionItem,
  Bill,
  Document,
  ImportantDate,
  Subscription,
  Task,
  WeatherSnapshot,
} from "@veedu/types";

export const visibilitySchema = z.enum(["shared", "private"]);
export const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);
export const taskStatusSchema = z.enum([
  "todo",
  "in_progress",
  "done",
  "cancelled",
]);
export const frequencySchema = z.enum([
  "once",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
]);

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().optional().nullable(),
  priority: taskPrioritySchema.default("medium"),
  status: taskStatusSchema.default("todo"),
  due_date: z.string().optional().nullable(),
  visibility: visibilitySchema.default("shared"),
  owner_id: z.string().uuid().optional().nullable(),
});

export const billSchema = z.object({
  name: z.string().min(1, "Name is required"),
  provider: z.string().optional().nullable(),
  amount: z.coerce.number().positive("Amount must be positive"),
  currency: z.string().min(1).default("EUR"),
  due_date: z.string().min(1, "Due date is required"),
  frequency: frequencySchema.default("monthly"),
  category: z.string().optional().nullable(),
  status: z
    .enum(["upcoming", "due", "overdue", "paid", "scheduled"])
    .default("upcoming"),
  visibility: visibilitySchema.default("shared"),
  notes: z.string().optional().nullable(),
});

export const subscriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  provider: z.string().optional().nullable(),
  amount: z.coerce.number().positive(),
  currency: z.string().default("EUR"),
  billing_frequency: frequencySchema.default("monthly"),
  next_renewal: z.string().min(1),
  category: z.string().optional().nullable(),
  status: z.enum(["active", "paused", "cancelled"]).default("active"),
  visibility: visibilitySchema.default("shared"),
  payment_reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const documentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().optional().nullable(),
  status: z
    .enum(["valid", "expiring_soon", "expired", "missing"])
    .default("valid"),
  issued_at: z.string().optional().nullable(),
  expires_at: z.string().optional().nullable(),
  visibility: visibilitySchema.default("shared"),
  notes: z.string().optional().nullable(),
});

export const accountSchema = z.object({
  institution: z.string().min(1),
  nickname: z.string().min(1),
  account_type: z.string().min(1),
  reference: z.string().optional().nullable(),
  last_four: z
    .string()
    .regex(/^\d{4}$/, "Last 4 digits only")
    .optional()
    .nullable(),
  visibility: visibilitySchema.default("shared"),
  notes: z.string().optional().nullable(),
});

export const contactSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  category: z.string().min(1),
  visibility: visibilitySchema.default("shared"),
  notes: z.string().optional().nullable(),
});

export const placeSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal("")),
  rating: z.coerce.number().min(0).max(5).optional().nullable(),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  visited: z.boolean().default(false),
  visibility: visibilitySchema.default("shared"),
  notes: z.string().optional().nullable(),
});

export const importantDateSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  category: z.string().min(1),
  reminder_days: z.coerce.number().int().min(0).optional().nullable(),
  visibility: visibilitySchema.default("shared"),
  notes: z.string().optional().nullable(),
});

export const homeItemSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  purchased_at: z.string().optional().nullable(),
  warranty_until: z.string().optional().nullable(),
  visibility: visibilitySchema.default("shared"),
  notes: z.string().optional().nullable(),
});

export const homeServiceSchema = z.object({
  name: z.string().min(1),
  provider: z.string().optional().nullable(),
  last_serviced_at: z.string().optional().nullable(),
  next_due_at: z.string().optional().nullable(),
  visibility: visibilitySchema.default("shared"),
  notes: z.string().optional().nullable(),
});

export const onboardingSchema = z.object({
  household_name: z.string().min(1, "Household name is required"),
  member_name: z.string().optional(),
  member_email: z.string().email().optional().or(z.literal("")),
  home_location: z.string().min(1, "Home location is required"),
  parents_location: z.string().optional(),
  currency: z.string().min(1).default("EUR"),
  timezone: z.string().min(1).default("Europe/Brussels"),
});

export const authSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(1).optional(),
});

export function formatMoney(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-BE", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatRelativeDue(dateStr: string): string {
  const date = startOfDay(parseISO(dateStr));
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "d MMM");
}

export function daysUntil(dateStr: string, from = new Date()): number {
  return differenceInCalendarDays(parseISO(dateStr), startOfDay(from));
}

export function documentStatusFromExpiry(
  expiresAt: string | null,
): "valid" | "expiring_soon" | "expired" | "missing" {
  if (!expiresAt) return "missing";
  const days = daysUntil(expiresAt);
  if (days < 0) return "expired";
  if (days <= 30) return "expiring_soon";
  return "valid";
}

export function buildAttentionItems(input: {
  documents: Document[];
  bills: Bill[];
  tasks: Task[];
  subscriptions: Subscription[];
  importantDates: ImportantDate[];
}): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const doc of input.documents) {
    if (!doc.expires_at) continue;
    const days = daysUntil(doc.expires_at);
    if (days < 0) {
      items.push({
        id: `doc-${doc.id}`,
        title: doc.title,
        detail: "Expired",
        priority: "critical",
        href: `/documents/${doc.id}`,
      });
    } else if (days <= 60) {
      items.push({
        id: `doc-${doc.id}`,
        title: doc.title,
        detail: `Expires in ${days} days`,
        priority: days <= 7 ? "high" : "normal",
        href: `/documents/${doc.id}`,
      });
    }
  }

  for (const bill of input.bills) {
    if (bill.status === "paid") continue;
    const days = daysUntil(bill.due_date);
    if (days < 0) {
      items.push({
        id: `bill-${bill.id}`,
        title: bill.name,
        detail: "Payment overdue",
        priority: "critical",
        href: "/bills",
      });
    } else if (days <= 1) {
      items.push({
        id: `bill-${bill.id}`,
        title: bill.name,
        detail: days === 0 ? "Payment due today" : "Payment due tomorrow",
        priority: "high",
        href: "/bills",
      });
    }
  }

  for (const task of input.tasks) {
    if (task.status === "done" || task.status === "cancelled" || !task.due_date)
      continue;
    if (isBefore(parseISO(task.due_date), startOfDay(new Date()))) {
      items.push({
        id: `task-${task.id}`,
        title: task.title,
        detail: "Overdue",
        priority: "high",
        href: "/tasks",
      });
    }
  }

  for (const sub of input.subscriptions) {
    if (sub.status !== "active") continue;
    const days = daysUntil(sub.next_renewal);
    if (days >= 0 && days <= 7) {
      items.push({
        id: `sub-${sub.id}`,
        title: sub.name,
        detail: `Renews in ${days} days`,
        priority: "normal",
        href: "/subscriptions",
      });
    }
  }

  for (const date of input.importantDates) {
    const days = daysUntil(date.date);
    if (days >= 0 && days <= 3) {
      items.push({
        id: `date-${date.id}`,
        title: date.title,
        detail: days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`,
        priority: "normal",
        href: "/important-dates",
      });
    }
  }

  const order = { critical: 0, high: 1, normal: 2, low: 3 } as const;
  return items.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 8);
}

export function greetingForHour(hour: number, name: string): string {
  const first = name.split(" ")[0] || "there";
  if (hour < 12) return `Good morning, ${first}.`;
  if (hour < 18) return `Good afternoon, ${first}.`;
  return `Good evening, ${first}.`;
}

export function stubWeather(
  home = "Antwerp",
  parents = "Dindigul",
): { home: WeatherSnapshot; parents: WeatherSnapshot } {
  return {
    home: {
      location_label: home,
      temperature_c: 14,
      condition: "Mostly cloudy",
      feels_like_c: 13,
      humidity: 72,
    },
    parents: {
      location_label: parents,
      temperature_c: 29,
      condition: "Clear",
      feels_like_c: 31,
      humidity: 58,
    },
  };
}

export function taskProgress(tasks: Task[]): {
  open: number;
  overdue: number;
  done: number;
  percent: number;
} {
  const actionable = tasks.filter((t) => t.status !== "cancelled");
  const open = actionable.filter((t) => t.status !== "done").length;
  const done = actionable.filter((t) => t.status === "done").length;
  const overdue = actionable.filter(
    (t) =>
      t.status !== "done" &&
      t.due_date &&
      isBefore(parseISO(t.due_date), startOfDay(new Date())),
  ).length;
  const percent =
    actionable.length === 0
      ? 100
      : Math.round((done / actionable.length) * 100);
  return { open, overdue, done, percent };
}
