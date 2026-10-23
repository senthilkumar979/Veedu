"use client";

import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
} from "@veedu/ui";
import { taskSchema } from "@veedu/domain";
import { TASK_CATEGORIES } from "@veedu/types";

type FormValues = z.infer<typeof taskSchema>;

interface TaskFormDialogProps {
  open: boolean;
  editing: boolean;
  form: UseFormReturn<FormValues>;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormValues) => Promise<void>;
}

export function TaskFormDialog({
  open,
  editing,
  form,
  onOpenChange,
  onSubmit,
}: TaskFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit task" : "Add task"}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit((values) => void onSubmit(values))}
        >
          <Input label="Title" {...form.register("title")} />
          <Input label="Description" {...form.register("description")} />
          <Select
            label="Category"
            value={form.watch("category") ?? "Home"}
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
          <Select
            label="Status"
            value={form.watch("status")}
            onValueChange={(v) =>
              form.setValue("status", v as FormValues["status"])
            }
            options={[
              { value: "todo", label: "To do" },
              { value: "in_progress", label: "In progress" },
              { value: "done", label: "Done" },
            ]}
          />
          <Input label="Due date" type="date" {...form.register("due_date")} />
          <Button type="submit" className="w-full">
            {editing ? "Save changes" : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
