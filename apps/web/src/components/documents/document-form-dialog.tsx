"use client";

import { useState } from "react";
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
import { documentSchema } from "@veedu/domain";

type Values = z.infer<typeof documentSchema>;
type AddMode = "link" | "upload";

interface DocumentFormDialogProps {
  open: boolean;
  form: UseFormReturn<Values>;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Values, file: File | null) => Promise<void>;
}

export function DocumentFormDialog({
  open,
  form,
  pending,
  onOpenChange,
  onSubmit,
}: DocumentFormDialogProps) {
  const [mode, setMode] = useState<AddMode>("link");
  const [file, setFile] = useState<File | null>(null);

  function resetLocal() {
    setMode("link");
    setFile(null);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) resetLocal();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add document</DialogTitle>
        </DialogHeader>

        <div
          className="mb-4 inline-flex w-full rounded-xl bg-surface-subtle p-1"
          role="tablist"
          aria-label="Add method"
        >
          {(
            [
              { id: "link", label: "Share link" },
              { id: "upload", label: "Upload" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={mode === tab.id}
              onClick={() => setMode(tab.id)}
              className={`min-h-10 flex-1 rounded-lg px-3 text-sm font-medium transition-colors ${
                mode === tab.id
                  ? "bg-surface text-primary shadow-card"
                  : "text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form
          className="space-y-3"
          onSubmit={form.handleSubmit(async (values) => {
            if (mode === "link") {
              const url = (values.share_url ?? "").trim();
              if (!url) {
                form.setError("share_url", {
                  message: "Paste your Adobe share link",
                });
                return;
              }
              await onSubmit({ ...values, share_url: url }, null);
            } else {
              await onSubmit({ ...values, share_url: "" }, file);
            }
            resetLocal();
          })}
        >
          <Input
            label="Name"
            placeholder="e.g. Passport scan"
            {...form.register("title")}
            error={form.formState.errors.title?.message}
          />

          {mode === "link" ? (
            <Input
              label="Adobe share link"
              placeholder="https://acrobat.adobe.com/…"
              {...form.register("share_url")}
              error={form.formState.errors.share_url?.message}
            />
          ) : (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                File
              </label>
              <input
                type="file"
                className="block w-full text-sm text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          )}

          <Select
            label="Category"
            value={form.watch("category") ?? "Other"}
            onValueChange={(v) => form.setValue("category", v)}
            options={["Identity", "Housing", "Insurance", "Vehicle", "Other"].map(
              (c) => ({ value: c, label: c }),
            )}
          />
          <Input label="Expires" type="date" {...form.register("expires_at")} />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending
              ? "Saving…"
              : mode === "link"
                ? "Save link"
                : file
                  ? "Upload"
                  : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
