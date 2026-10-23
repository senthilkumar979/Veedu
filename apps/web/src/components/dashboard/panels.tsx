import type { ReactNode } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@veedu/ui";
import { formatRelativeDue } from "@veedu/domain";
import type { CalendarEvent, Task } from "@veedu/types";

interface PanelProps {
  title: string;
  href?: string;
  action?: string;
  className?: string;
  children: ReactNode;
}

export function DashboardPanel({
  title,
  href,
  action,
  className,
  children,
}: PanelProps) {
  return (
    <Card className={`flex min-h-0 flex-col overflow-hidden ${className ?? ""}`}>
      <CardHeader className="shrink-0 pb-0">
        <CardTitle>{title}</CardTitle>
        {href && action ? (
          <Link href={href} className="text-sm font-medium text-primary">
            {action}
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto">{children}</CardContent>
    </Card>
  );
}

export function TodayPanel({
  events,
  className,
}: {
  events: CalendarEvent[];
  className?: string;
}) {
  return (
    <DashboardPanel title="Today" href="/calendar" action="Agenda" className={className}>
      {events.length === 0 ? (
        <p className="text-sm text-muted">No events scheduled today.</p>
      ) : (
        <ul className="space-y-2">
          {events.map((event) => (
            <li key={event.id} className="flex min-h-12 items-center gap-3 text-sm">
              <span className="w-14 shrink-0 font-medium text-primary">
                {format(new Date(event.start_at), "HH:mm")}
              </span>
              <span className="text-ink">{event.title}</span>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}

interface TaskProgress {
  open: number;
  overdue: number;
  percent: number;
}

export function TasksPanel({
  tasks,
  progress,
  className,
}: {
  tasks: Task[];
  progress: TaskProgress;
  className?: string;
}) {
  return (
    <DashboardPanel title="Tasks" href="/tasks" action="View all" className={className}>
      <div className="mb-2 flex items-center justify-between gap-2 text-sm">
        <Badge tone="primary">{progress.open} open</Badge>
        <span className="text-muted">
          {progress.overdue > 0 ? `${progress.overdue} overdue` : "On track"}
        </span>
        <span className="font-medium text-ink">{progress.percent}%</span>
      </div>
      <div className="mb-3 h-2 overflow-hidden rounded-pill bg-surface-subtle">
        <div
          className="h-full rounded-pill bg-primary"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-start justify-between gap-2 text-sm">
            <span className="text-ink">{task.title}</span>
            <span className="shrink-0 text-xs text-muted">
              {task.due_date ? formatRelativeDue(task.due_date) : "No due"}
            </span>
          </li>
        ))}
      </ul>
    </DashboardPanel>
  );
}
