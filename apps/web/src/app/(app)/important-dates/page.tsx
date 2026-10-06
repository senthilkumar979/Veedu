"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Badge, Button, Card, CardContent, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Select,
} from "@veedu/ui";
import { importantDateSchema } from "@veedu/domain";
import { IMPORTANT_DATE_CATEGORIES } from "@veedu/types";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/shared/states";
import { useHouseholdData } from "@/lib/data";

type Values = z.infer<typeof importantDateSchema>;

function ImportantDatesInner() {
  const search = useSearchParams();
  const { importantDates, addImportantDate } = useHouseholdData();
  const [open, setOpen] = useState(search.get("new") === "1");
  const [category, setCategory] = useState<string>("All");
  const form = useForm<Values>({
    resolver: zodResolver(importantDateSchema),
    defaultValues: { title: "", date: "", category: "Birthdays", visibility: "shared", notes: "", reminder_days: 3 },
  });

  const list = useMemo(() => {
    const rows = [...(importantDates.data ?? [])].sort((a, b) => a.date.localeCompare(b.date));
    if (category === "All") return rows;
    return rows.filter((r) => r.category === category);
  }, [importantDates.data, category]);

  if (importantDates.isLoading) return <PageContainer title="Important Dates"><LoadingBlock /></PageContainer>;
  if (importantDates.isError) return <PageContainer title="Important Dates"><ErrorState onRetry={() => void importantDates.refetch()} /></PageContainer>;

  return (
    <PageContainer title="Important Dates" description="Birthdays, renewals, travel, and family memory" actions={<Button onClick={() => setOpen(true)}>Add date</Button>}>
      <div className="mb-4 flex flex-wrap gap-2">
        {["All", ...IMPORTANT_DATE_CATEGORIES].map((c) => (
          <button key={c} type="button" onClick={() => setCategory(c)} className={`rounded-pill px-3 py-1.5 text-xs font-medium ${category === c ? "bg-primary text-white" : "border border-border bg-surface text-muted"}`}>{c}</button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState title="No important dates yet" actionLabel="Add date" onAction={() => setOpen(true)} />
      ) : (
        <ul className="space-y-2">
          {list.map((item) => (
            <li key={item.id}>
              <Card>
                <CardContent className="flex items-center justify-between gap-3 py-4">
                  <div>
                    <p className="text-sm font-medium text-ink">{format(new Date(item.date), "d MMM")} — {item.title}</p>
                    <p className="text-xs text-muted">{item.category}{item.notes ? ` · ${item.notes}` : ""}</p>
                  </div>
                  <Badge tone="primary">{item.visibility}</Badge>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add important date</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={form.handleSubmit(async (values) => { await addImportantDate.mutateAsync(values); setOpen(false); form.reset(); })}>
            <Input label="Title" error={form.formState.errors.title?.message} {...form.register("title")} />
            <Input label="Date" type="date" {...form.register("date")} />
            <Select label="Category" value={form.watch("category")} onValueChange={(v) => form.setValue("category", v)} options={IMPORTANT_DATE_CATEGORIES.map((c) => ({ value: c, label: c }))} />
            <Input label="Notes" {...form.register("notes")} />
            <Button type="submit" className="w-full">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

export default function ImportantDatesPage() {
  return (
    <Suspense fallback={<PageContainer title="Important Dates"><LoadingBlock /></PageContainer>}>
      <ImportantDatesInner />
    </Suspense>
  );
}
