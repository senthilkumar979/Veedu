"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Select } from "@veedu/ui";
import { subscriptionSchema, formatMoney, formatRelativeDue, daysUntil } from "@veedu/domain";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/shared/states";
import { useHouseholdData } from "@/lib/data";

type Values = z.infer<typeof subscriptionSchema>;

function SubsInner() {
  const search = useSearchParams();
  const { subscriptions, addSubscription } = useHouseholdData();
  const [open, setOpen] = useState(search.get("new") === "1");
  const form = useForm<Values>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: { name: "", provider: "", amount: 0, currency: "EUR", billing_frequency: "monthly", next_renewal: "", category: "Entertainment", status: "active", visibility: "shared", payment_reference: "", notes: "" },
  });

  const renewingSoon = useMemo(
    () => (subscriptions.data ?? []).filter((s) => s.status === "active" && daysUntil(s.next_renewal) <= 45).sort((a, b) => a.next_renewal.localeCompare(b.next_renewal)),
    [subscriptions.data],
  );

  if (subscriptions.isLoading) return <PageContainer title="Subscriptions"><LoadingBlock /></PageContainer>;
  if (subscriptions.isError) return <PageContainer title="Subscriptions"><ErrorState onRetry={() => void subscriptions.refetch()} /></PageContainer>;

  return (
    <PageContainer title="Subscriptions" description="Recurring services and renewals" actions={<Button onClick={() => setOpen(true)}>Add subscription</Button>}>
      <Card className="mb-4">
        <CardHeader><CardTitle>Renewing soon</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {renewingSoon.length === 0 ? <p className="text-sm text-muted">No renewals in the next 45 days.</p> : renewingSoon.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-sm">
              <span className="font-medium text-ink">{s.name}</span>
              <span className="text-muted">{daysUntil(s.next_renewal)} days</span>
            </div>
          ))}
        </CardContent>
      </Card>
      {(subscriptions.data ?? []).length === 0 ? (
        <EmptyState title="No subscriptions" actionLabel="Add subscription" onAction={() => setOpen(true)} />
      ) : (
        <ul className="space-y-2">
          {(subscriptions.data ?? []).map((s) => (
            <li key={s.id}><Card><CardContent className="flex items-center justify-between gap-3 py-4">
              <div>
                <p className="text-sm font-medium text-ink">{s.name}</p>
                <p className="text-xs text-muted">{formatMoney(s.amount, s.currency)} / {s.billing_frequency} · Next {formatRelativeDue(s.next_renewal)}</p>
              </div>
              <Badge tone={s.status === "active" ? "success" : "neutral"}>{s.status}</Badge>
            </CardContent></Card></li>
          ))}
        </ul>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add subscription</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={form.handleSubmit(async (values) => { await addSubscription.mutateAsync(values); setOpen(false); form.reset(); })}>
            <Input label="Name" {...form.register("name")} />
            <Input label="Provider" {...form.register("provider")} />
            <Input label="Amount" type="number" step="0.01" {...form.register("amount")} />
            <Input label="Next renewal" type="date" {...form.register("next_renewal")} />
            <Select label="Billing frequency" value={form.watch("billing_frequency")} onValueChange={(v) => form.setValue("billing_frequency", v as Values["billing_frequency"])} options={[{value:"monthly",label:"Monthly"},{value:"yearly",label:"Yearly"},{value:"quarterly",label:"Quarterly"}]} />
            <Button type="submit" className="w-full">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

export default function SubscriptionsPage() {
  return <Suspense fallback={<PageContainer title="Subscriptions"><LoadingBlock /></PageContainer>}><SubsInner /></Suspense>;
}
