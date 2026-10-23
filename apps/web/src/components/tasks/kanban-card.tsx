"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@veedu/ui";
import { formatRelativeDue } from "@veedu/domain";
import type { Task } from "@veedu/types";

export function DraggableTask({
  task,
  onEdit,
}: {
  task: Task;
  onEdit?: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={isDragging ? "opacity-40" : undefined}
      {...listeners}
      {...attributes}
    >
      <TaskCard task={task} onEdit={onEdit} />
    </div>
  );
}

export function TaskCard({
  task,
  dragging,
  onEdit,
}: {
  task: Task;
  dragging?: boolean;
  onEdit?: (task: Task) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onEdit?.(task)}
      className={`w-full rounded-xl border border-border bg-surface p-3 text-left shadow-card transition hover:border-primary/30 ${
        dragging ? "shadow-popover rotate-1" : ""
      }`}
    >
      <p className="text-sm font-semibold text-ink">{task.title}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge tone="neutral">{task.category || "Task"}</Badge>
        <Badge
          tone={
            task.priority === "high" || task.priority === "urgent"
              ? "danger"
              : "primary"
          }
        >
          {task.priority}
        </Badge>
      </div>
      {task.due_date ? (
        <p className="mt-2 text-xs text-muted">
          Due {formatRelativeDue(task.due_date)}
        </p>
      ) : null}
    </button>
  );
}
