"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { Task, TaskStatus } from "@veedu/types";
import { DraggableTask, TaskCard } from "@/components/tasks/kanban-card";

const COLUMNS: { id: TaskStatus; label: string; tone: string }[] = [
  { id: "todo", label: "To do", tone: "bg-surface-subtle" },
  { id: "in_progress", label: "In progress", tone: "bg-info-soft" },
  { id: "done", label: "Done", tone: "bg-success-soft" },
];

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onEdit?: (task: Task) => void;
}

export function KanbanBoard({ tasks, onStatusChange, onEdit }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const boardTasks = useMemo(
    () => tasks.filter((t) => t.status !== "cancelled"),
    [tasks],
  );
  const activeTask = boardTasks.find((t) => t.id === activeId) ?? null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const taskId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    if (!overId) return;

    const overColumn = COLUMNS.find((c) => c.id === overId)?.id;
    const overTask = boardTasks.find((t) => t.id === overId);
    const nextStatus = overColumn ?? overTask?.status;
    const task = boardTasks.find((t) => t.id === taskId);
    if (!task || !nextStatus || task.status === nextStatus) return;
    onStatusChange(taskId, nextStatus);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-3 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={boardTasks.filter((t) => t.status === col.id)}
            onEdit={onEdit}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} dragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({
  column,
  tasks,
  onEdit,
}: {
  column: (typeof COLUMNS)[number];
  tasks: Task[];
  onEdit?: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-[28rem] flex-col rounded-2xl border border-border ${column.tone} p-3 transition-shadow ${
        isOver ? "ring-2 ring-accent/60" : ""
      }`}
    >
      <header className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-ink">{column.label}</h2>
        <span className="rounded-pill bg-surface px-2 py-0.5 text-xs font-medium text-muted">
          {tasks.length}
        </span>
      </header>
      <ul className="flex flex-1 flex-col gap-2">
        {tasks.map((task) => (
          <li key={task.id}>
            <DraggableTask task={task} onEdit={onEdit} />
          </li>
        ))}
      </ul>
    </section>
  );
}
