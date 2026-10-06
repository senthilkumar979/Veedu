"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Select } from "@veedu/ui";
import { billSchema, formatMoney, formatRelativeDue } from "@veedu/domain";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/shared/states";
import { useHouseholdData } from "@/lib/data";

type Values = z.infer<typeof billSchema>;

function BillsInner() {
  const search = useSearchParams();
  const { bills, addBill } = useHouseholdData();
  const [open, setOpen] = useState(search.get("new") === "1");
  const form = useForm<Values>({
    resolver: zodResolver(billSchema),
    defaultValues: { name: "", provider: "", amount: 0, currency: "EUR", due_date: "", frequency: "monthly", category: "Utilities", status: "upcoming", visibility: "shared", notes: "" },
  });

  const totals = useMemo(() => {
    const list = bills.data ?? [];
    const expected = list.reduce((s, b) => s + Number(b.amount), 0);
    const upcoming = list.filter((b) => b.status !== "paid").reduce((s, b) => s + Number(b.amount), 0);
    return { expected, upcoming, count: list.length };
  }, [bills.data]);

  if (bills.isLoading) return <PageContainer title="Bills"><LoadingBlock /></PageContainer>;
  if (bills.isError) return <PageContainer title="Bills"><ErrorState onRetry={() => void bills.refetch()} /></PageContainer>;

  return (
    <PageContainer title="Bills" description="Household administration" actions={<Button onClick={() => setOpen(true)}>Add bill</Button>}>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card><CardHeader><CardTitle>This month</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{formatMoney(totals.expected)}</p><p className="text-xs text-muted">Expected household expenses</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Upcoming</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{formatMoney(totals.upcoming)}</p><p className="text-xs text-muted">Still to settle</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Active</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{totals.count}</p><p className="text-xs text-muted">Recurring items</p></CardContent></Card>
      </div>
      {(bills.data ?? []).length === 0 ? (
        <EmptyState title="No bills yet" actionLabel="Add bill" onAction={() => setOpen(true)} />
      ) : (
        <ul className="space-y-2">
          {(bills.data ?? []).map((b) => (
            <li key={b.id}><Card><CardContent className="flex items-center justify-between gap-3 py-4">
              <div>
                <p className="text-sm font-medium text-ink">{b.name}</p>
                <p className="text-xs text-muted">{b.provider || "Provider"} · {formatRelativeDue(b.due_date)} · {b.frequency}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatMoney(b.amount, b.currency)}</p>
                <Badge tone={b.status === "overdue" || b.status === "due" ? "warning" : "neutral"}>{b.status}</Badge>
              </div>
            </CardContent></Card></li>
          ))}
        </ul>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add bill</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={form.handleSubmit(async (values) => { await addBill.mutateAsync(values); setOpen(false); form.reset(); })}>
            <Input label="Name" {...form.register("name")} error={form.formState.errors.name?.message} />
            <Input label="Provider" {...form.register("provider")} />
            <Input label="Amount" type="number" step="0.01" {...form.register("amount")} />
            <Input label="Due date" type="date" {...form.register("due_date")} />
            <Select label="Frequency" value={form.watch("frequency")} onValueChange={(v) => form.setValue("frequency", v as Values["frequency"])} options={[{value:"once",label:"Once"},{value:"monthly",label:"Monthly"},{value:"yearly",label:"Yearly"}]} />
            <Button type="submit" className="w-full">Save bill</Button>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

export default function BillsPage() {
  return <Suspense fallback={<PageContainer title="Bills"><LoadingBlock /></PageContainer>}><BillsInner /></Suspense>;
}
