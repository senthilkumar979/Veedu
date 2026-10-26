"use client";

import Link from "next/link";
import { Badge } from "@veedu/ui";
import { formatRelativeDue } from "@veedu/domain";
import type { Task } from "@veedu/types";
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
      eyebrow="Household"
      title="Tasks"
      action={
        <Link href="/tasks" className="text-sm font-medium text-primary">
          All tasks
        </Link>
      }
      summary={
        <div>
          <Progress progress={progress} />
          <TaskList tasks={tasks.slice(0, 3)} />
        </div>
      }
    >
      <div>
        <Progress progress={progress} />
        <TaskList tasks={tasks} detailed />
      </div>
    </ExpandableSection>
  );
}

function Progress({ progress }: { progress: TaskProgress }) {
  return (
    <div className="mb-3">
      <div className="mb-2 flex items-center justify-between gap-2 text-sm">
        <Badge tone="primary">{progress.open} open</Badge>
        <span className="text-muted">
          {progress.overdue > 0 ? `${progress.overdue} overdue` : "On track"}
        </span>
        <span className="font-medium text-ink">{progress.percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-pill bg-surface-subtle">
        <div className="h-full rounded-pill bg-primary" style={{ width: `${progress.percent}%` }} />
      </div>
    </div>
  );
}

function TaskList({ tasks, detailed }: { tasks: Task[]; detailed?: boolean }) {
  if (tasks.length === 0) {
    return <p className="text-sm text-muted">No open tasks.</p>;
  }
  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li key={task.id} className="rounded-lg border border-border px-3 py-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-ink">{task.title}</p>
            <Badge
              tone={task.priority === "urgent" || task.priority === "high" ? "danger" : "neutral"}
            >
              {task.priority}
            </Badge>
          </div>
          <p className="text-xs text-muted">
            {task.category || "General"} ·{" "}
            {task.due_date ? formatRelativeDue(task.due_date) : "No due date"}
          </p>
          {detailed && task.description ? (
            <p className="mt-1 text-sm text-muted">{task.description}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
