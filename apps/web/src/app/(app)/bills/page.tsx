"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
} from "@veedu/ui";
import { billSchema, formatMoney, formatRelativeDue } from "@veedu/domain";
import { resolveCurrency, type Bill } from "@veedu/types";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/shared/states";
import { RowActions } from "@/components/shared/row-actions";
import { CurrencySelect } from "@/components/shared/currency-select";
import { useHouseholdData } from "@/lib/data";
import { usePreferredCurrency } from "@/lib/use-preferred-currency";

type Values = z.infer<typeof billSchema>;

function BillsInner() {
  const search = useSearchParams();
  const preferredCurrency = usePreferredCurrency();
  const { bills, documents, addBill, updateBill, archiveBill } =
    useHouseholdData();
  const [open, setOpen] = useState(search.get("new") === "1");
  const [editing, setEditing] = useState<Bill | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      name: "",
      provider: "",
      amount: 0,
      currency: preferredCurrency,
      due_date: "",
      frequency: "monthly",
      category: "Utilities",
      status: "upcoming",
      document_id: null,
      visibility: "shared",
      notes: "",
    },
  });

  const totals = useMemo(() => {
    const list = (bills.data ?? []).filter(
      (b) => b.currency === preferredCurrency,
    );
    const expected = list.reduce((s, b) => s + Number(b.amount), 0);
    const upcoming = list
      .filter((b) => b.status !== "paid")
      .reduce((s, b) => s + Number(b.amount), 0);
    return { expected, upcoming, count: (bills.data ?? []).length };
  }, [bills.data, preferredCurrency]);

  function openCreate() {
    setEditing(null);
    form.reset({
      name: "",
      provider: "",
      amount: 0,
      currency: preferredCurrency,
      due_date: "",
      frequency: "monthly",
      category: "Utilities",
      status: "upcoming",
      document_id: null,
      visibility: "shared",
      notes: "",
    });
    setOpen(true);
  }

  function openEdit(b: Bill) {
    setEditing(b);
    form.reset({
      name: b.name,
      provider: b.provider ?? "",
      amount: Number(b.amount),
      currency: resolveCurrency(b.currency),
      due_date: b.due_date,
      frequency: b.frequency,
      category: b.category ?? "Utilities",
      status: b.status,
      document_id: b.document_id ?? null,
      visibility: b.visibility,
      notes: b.notes ?? "",
    });
    setOpen(true);
  }

  if (bills.isLoading)
    return (
      <PageContainer title="Bills">
        <LoadingBlock />
      </PageContainer>
    );
  if (bills.isError)
    return (
      <PageContainer title="Bills">
        <ErrorState onRetry={() => void bills.refetch()} />
      </PageContainer>
    );

  return (
    <PageContainer
      title="Bills"
      description="Household administration"
      actions={<Button onClick={openCreate}>Add bill</Button>}
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>This month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatMoney(totals.expected, preferredCurrency)}
            </p>
            <p className="text-xs text-muted">Expected in {preferredCurrency}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatMoney(totals.upcoming, preferredCurrency)}
            </p>
            <p className="text-xs text-muted">Still to settle</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totals.count}</p>
            <p className="text-xs text-muted">Recurring items</p>
          </CardContent>
        </Card>
      </div>
      {(bills.data ?? []).length === 0 ? (
        <EmptyState title="No bills yet" actionLabel="Add bill" onAction={openCreate} />
      ) : (
        <ul className="space-y-2">
          {(bills.data ?? []).map((b) => (
            <li key={b.id}>
              <Card>
                <CardContent className="flex items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <p className="text-base font-medium text-ink">{b.name}</p>
                    <p className="text-sm font-medium text-ink">
                      {formatRelativeDue(b.due_date)}
                    </p>
                    <p className="text-sm text-muted">
                      {b.provider || "Provider"} · {b.frequency}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-ink">
                        {formatMoney(b.amount, b.currency)}
                      </p>
                      <Badge
                        tone={
                          b.status === "overdue" || b.status === "due"
                            ? "warning"
                            : "neutral"
                        }
                      >
                        {b.status}
                      </Badge>
                    </div>
                    <RowActions
                      onEdit={() => openEdit(b)}
                      onArchive={() => void archiveBill.mutateAsync(b.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit bill" : "Add bill"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit(async (values) => {
              if (editing) {
                await updateBill.mutateAsync({ id: editing.id, patch: values });
              } else {
                await addBill.mutateAsync(values);
              }
              setOpen(false);
              setEditing(null);
              form.reset();
            })}
          >
            <Input
              label="Name"
              {...form.register("name")}
              error={form.formState.errors.name?.message}
            />
            <Input label="Provider" {...form.register("provider")} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Amount"
                type="number"
                step="0.01"
                {...form.register("amount")}
              />
              <CurrencySelect
                value={form.watch("currency")}
                onValueChange={(v) => form.setValue("currency", v)}
              />
            </div>
            <Input label="Due date" type="date" {...form.register("due_date")} />
            <Select
              label="Frequency"
              value={form.watch("frequency")}
              onValueChange={(v) =>
                form.setValue("frequency", v as Values["frequency"])
              }
              options={[
                { value: "once", label: "Once" },
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly" },
              ]}
            />
            <Select
              label="Status"
              value={form.watch("status")}
              onValueChange={(v) => form.setValue("status", v as Values["status"])}
              options={[
                { value: "upcoming", label: "Upcoming" },
                { value: "due", label: "Due" },
                { value: "overdue", label: "Overdue" },
                { value: "paid", label: "Paid" },
                { value: "scheduled", label: "Scheduled" },
              ]}
            />
            <Select
              label="Linked document (optional)"
              value={form.watch("document_id") || "__none__"}
              onValueChange={(v) =>
                form.setValue(
                  "document_id",
                  v === "__none__" ? null : v,
                )
              }
              options={[
                { value: "__none__", label: "None" },
                ...(documents.data ?? []).map((d) => ({
                  value: d.id,
                  label: d.title,
                })),
              ]}
            />
            <Button type="submit" className="w-full">
              {editing ? "Save changes" : "Save bill"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

export default function BillsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer title="Bills">
          <LoadingBlock />
        </PageContainer>
      }
    >
      <BillsInner />
    </Suspense>
  );
}
