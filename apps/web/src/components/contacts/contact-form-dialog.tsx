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
import { contactSchema } from "@veedu/domain";
import { CONTACT_CATEGORIES } from "@veedu/types";

type Values = z.infer<typeof contactSchema>;

interface ContactFormDialogProps {
  open: boolean;
  editing: boolean;
  form: UseFormReturn<Values>;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Values) => Promise<void>;
}

export function ContactFormDialog({
  open,
  editing,
  form,
  onOpenChange,
  onSubmit,
}: ContactFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit contact" : "Add contact"}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values);
          })}
        >
          <Input label="Name" {...form.register("name")} />
          <Input label="Phone" {...form.register("phone")} />
          <Input label="Email" type="email" {...form.register("email")} />
          <Select
            label="Category"
            value={form.watch("category")}
            onValueChange={(v) => form.setValue("category", v)}
            options={CONTACT_CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
          <Input label="Notes" {...form.register("notes")} />
          <Button type="submit" className="w-full">
            {editing ? "Save changes" : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
