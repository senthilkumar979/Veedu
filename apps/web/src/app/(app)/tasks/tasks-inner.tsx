"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
} from "@veedu/ui";
import { taskSchema, formatRelativeDue } from "@veedu/domain";
import { TASK_CATEGORIES } from "@veedu/types";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/shared/states";
import { useHouseholdData } from "@/lib/data";

type FormValues = z.infer<typeof taskSchema>;
type Filter =
  | "all"
  | "today"
  | "upcoming"
  | "overdue"
  | "completed"
  | "personal"
  | "shared";

export default function TasksPage() {
  const search = useSearchParams();
  const { tasks, addTask, updateTask } = useHouseholdData();
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState(search.get("new") === "1");
  const form = useForm<FormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Home",
      priority: "medium",
      status: "todo",
      visibility: "shared",
      due_date: "",
    },
  });

  const filtered = useMemo(() => {
    const list = tasks.data ?? [];
    const today = new Date().toISOString().slice(0, 10);
    return list.filter((t) => {
      if (filter === "completed") return t.status === "done";
      if (filter === "personal") return t.visibility === "private";
      if (filter === "shared") return t.visibility === "shared";
      if (t.status === "done" || t.status === "cancelled") return false;
      if (filter === "today") return t.due_date === today;
      if (filter === "upcoming") return Boolean(t.due_date && t.due_date > today);
      if (filter === "overdue") return Boolean(t.due_date && t.due_date < today);
      return true;
    });
  }, [tasks.data, filter]);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "today", label: "Today" },
    { id: "upcoming", label: "Upcoming" },
    { id: "overdue", label: "Overdue" },
    { id: "completed", label: "Completed" },
    { id: "personal", label: "Personal" },
    { id: "shared", label: "Shared" },
  ];

  if (tasks.isLoading) {
    return (
      <PageContainer title="Tasks">
        <LoadingBlock />
      </PageContainer>
    );
  }

  if (tasks.isError) {
    return (
      <PageContainer title="Tasks">
        <ErrorState onRetry={() => void tasks.refetch()} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Tasks"
      description={`${filtered.length} things in view`}
      actions={<Button onClick={() => setOpen(true)}>Add task</Button>}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-pill px-3 py-1.5 text-xs font-medium ${
              filter === f.id
                ? "bg-primary text-white"
                : "bg-surface text-muted border border-border"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No tasks here"
          description="Add something the household needs to finish."
          actionLabel="Add task"
          onAction={() => setOpen(true)}
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((task) => (
            <li key={task.id}>
              <Card>
                <CardContent className="flex items-start gap-3 py-4">
                  <Checkbox
                    checked={task.status === "done"}
                    onCheckedChange={(checked) =>
                      updateTask.mutate({
                        id: task.id,
                        patch: { status: checked ? "done" : "todo" },
                      })
                    }
                    aria-label={`Mark ${task.title} complete`}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        task.status === "done"
                          ? "text-muted line-through"
                          : "text-ink"
                      }`}
                    >
                      {task.title}
                      {task.visibility === "private" ? (
                        <Lock className="ml-1 inline h-3.5 w-3.5 text-subtle" />
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {task.category} · {task.visibility} · Due{" "}
                      {task.due_date ? formatRelativeDue(task.due_date) : "anytime"}
                    </p>
                  </div>
                  <Badge
                    tone={
                      task.priority === "urgent" || task.priority === "high"
                        ? "danger"
                        : "neutral"
                    }
                  >
                    {task.priority}
                  </Badge>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add task</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit(async (values) => {
              await addTask.mutateAsync(values);
              setOpen(false);
              form.reset();
            })}
          >
            <Input
              label="Title"
              error={form.formState.errors.title?.message}
              {...form.register("title")}
            />
            <Input label="Description" {...form.register("description")} />
            <Select
              label="Category"
              value={form.watch("category") ?? "Other"}
              onValueChange={(v) => form.setValue("category", v)}
              options={TASK_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
            <Select
              label="Priority"
              value={form.watch("priority")}
              onValueChange={(v) =>
                form.setValue("priority", v as FormValues["priority"])
              }
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
              ]}
            />
            <Input label="Due date" type="date" {...form.register("due_date")} />
            <Select
              label="Visibility"
              value={form.watch("visibility")}
              onValueChange={(v) =>
                form.setValue("visibility", v as FormValues["visibility"])
              }
              options={[
                { value: "shared", label: "Shared" },
                { value: "private", label: "Private" },
              ]}
            />
            <Button type="submit" className="w-full" disabled={addTask.isPending}>
              {addTask.isPending ? "Saving…" : "Save task"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
