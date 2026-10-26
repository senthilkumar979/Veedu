"use client";

import Link from "next/link";
import { formatRelativeDue } from "@veedu/domain";
import type { Task } from "@veedu/types";
import { cn } from "@veedu/ui";
import { ExpandableSection } from "./expandable-section";

interface TaskProgress {
  open: number;
  overdue: number;
  percent: number;
}

export function TaskBoard({
  tasks,
  progress,
}: {
  tasks: Task[];
  progress: TaskProgress;
}) {
  return (
    <ExpandableSection
      eyebrow={progress.overdue > 0 ? `${progress.overdue} overdue` : `${progress.percent}% done`}
      title="Tasks"
      action={
        <Link href="/tasks" className="text-xs font-medium text-primary">
          All
        </Link>
      }
      summary={<TaskList tasks={tasks.slice(0, 4)} />}
    >
      <TaskList tasks={tasks} detailed />
    </ExpandableSection>
  );
}

function TaskList({ tasks, detailed }: { tasks: Task[]; detailed?: boolean }) {
  if (tasks.length === 0) return <p className="py-2 text-sm text-muted">No open tasks.</p>;
  return (
    <ul className="divide-y divide-border">
      {tasks.map((task) => {
        const urgent = task.priority === "urgent" || task.priority === "high";
        return (
          <li key={task.id} className="flex items-start gap-2.5 py-2">
            <span
              className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", urgent ? "bg-danger" : "bg-primary")}
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm font-medium text-ink">{task.title}</span>
                <span className="shrink-0 text-xs text-muted">
                  {task.due_date ? formatRelativeDue(task.due_date) : "No date"}
                </span>
              </span>
              <span className="block truncate text-xs text-muted">
                {task.category || "General"}
                {detailed && task.description ? ` · ${task.description}` : ""}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
