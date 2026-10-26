"use client";

import Link from "next/link";
import { daysUntil, formatRelativeDue } from "@veedu/domain";
import { cn } from "@veedu/ui";
import type { Task } from "@veedu/types";
import { useHouseholdData } from "@/lib/data";
import { CardLink, DashboardCard } from "./dashboard-card";

export function TaskBoard({ tasks }: { tasks: Task[] }) {
  const { updateTask } = useHouseholdData();
  const preview = [...tasks].sort(compareTasks).slice(0, 5);

  return (
    <DashboardCard
      title="Tasks"
      meta={tasks.length === 0 ? "All caught up" : `${tasks.length} open`}
      action={
        <span className="flex items-center">
          <CardLink href="/tasks?new=1">Add</CardLink>
          <CardLink href="/tasks">All</CardLink>
        </span>
      }
    >
      {preview.length === 0 ? (
        <p className="py-1 text-sm text-muted">Nothing open.</p>
      ) : (
        <ul className="divide-y divide-border">
          {preview.map((task) => {
            const days = task.due_date ? daysUntil(task.due_date) : null;
            const urgent = days != null && days < 0;
            return (
              <li key={task.id} className="flex items-center gap-1 py-1">
                <button
                  type="button"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={`Mark ${task.title} done`}
                  onClick={() => updateTask.mutate({ id: task.id, patch: { status: "done" } })}
                >
                  <span className="h-4 w-4 rounded border border-border-strong" />
                </button>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{task.title}</span>
                  <span className={cn("block truncate text-xs", urgent ? "text-warning" : "text-muted")}>
                    {urgent ? "Overdue · " : days === 0 ? "Today · " : ""}
                    {task.due_date ? formatRelativeDue(task.due_date) : "No due date"}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {tasks.length > preview.length ? (
        <Link href="/tasks" className="mt-1 inline-flex text-xs font-medium text-primary">
          {tasks.length - preview.length} more
        </Link>
      ) : null}
    </DashboardCard>
  );
}

function compareTasks(a: Task, b: Task) {
  return rank(a) - rank(b) || (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999");
}

function rank(task: Task) {
  if (!task.due_date) return 3;
  const days = daysUntil(task.due_date);
  if (days < 0) return 0;
  if (days === 0) return 1;
  if (days <= 7) return 2;
  return 3;
}
