"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@veedu/ui";
import { taskSchema } from "@veedu/domain";
import type { Task, TaskStatus } from "@veedu/types";
import { PageContainer } from "@/components/layout/page-container";
import { ErrorState, LoadingBlock } from "@/components/shared/states";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { useHouseholdData } from "@/lib/data";

type FormValues = z.infer<typeof taskSchema>;

const emptyValues: FormValues = {
  title: "",
  description: "",
  category: "Home",
  priority: "medium",
  status: "todo",
  visibility: "shared",
  due_date: "",
};

export default function TasksPage() {
  const search = useSearchParams();
  const { tasks, addTask, updateTask } = useHouseholdData();
  const [open, setOpen] = useState(search.get("new") === "1");
  const [editing, setEditing] = useState<Task | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: emptyValues,
  });

  const active = useMemo(
    () => (tasks.data ?? []).filter((t) => t.status !== "cancelled"),
    [tasks.data],
  );

  function openCreate() {
    setEditing(null);
    form.reset(emptyValues);
    setOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    form.reset({
      title: task.title,
      description: task.description ?? "",
      category: task.category || "Home",
      priority: task.priority,
      status: task.status,
      visibility: task.visibility,
      due_date: task.due_date ?? "",
    });
    setOpen(true);
  }

  if (tasks.isLoading)
    return (
      <PageContainer title="Tasks">
        <LoadingBlock />
      </PageContainer>
    );
  if (tasks.isError)
    return (
      <PageContainer title="Tasks">
        <ErrorState onRetry={() => void tasks.refetch()} />
      </PageContainer>
    );

  return (
    <PageContainer className="gap-0">
      <section className="mb-5 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-5 shadow-card sm:px-6">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-accent">
            Board
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-muted">
            Drag cards between columns to update status · {active.length} open
          </p>
        </div>
        <Button onClick={openCreate}>Add task</Button>
      </section>

      <KanbanBoard
        tasks={active}
        onStatusChange={(id, status: TaskStatus) =>
          updateTask.mutate({ id, patch: { status } })
        }
        onEdit={openEdit}
      />

      <TaskFormDialog
        open={open}
        editing={Boolean(editing)}
        form={form}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEditing(null);
        }}
        onSubmit={async (values) => {
          if (editing) {
            await updateTask.mutateAsync({ id: editing.id, patch: values });
          } else {
            await addTask.mutateAsync(values);
          }
          setOpen(false);
          setEditing(null);
          form.reset();
        }}
      />
    </PageContainer>
  );
}
