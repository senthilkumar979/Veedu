"use client";

import { Suspense } from "react";
import { Button } from "@veedu/ui";
import { formatMoney } from "@veedu/domain";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/shared/states";
import { SubscriptionCard } from "@/components/subscriptions/subscription-card";
import { SubscriptionFormDialog } from "@/components/subscriptions/subscription-form-dialog";
import { useSubscriptionsPage } from "@/components/subscriptions/use-subscriptions-page";

function SubsInner() {
  const page = useSubscriptionsPage();

  if (page.subscriptions.isLoading)
    return (
      <PageContainer title="Subscriptions">
        <LoadingBlock />
      </PageContainer>
    );
  if (page.subscriptions.isError)
    return (
      <PageContainer title="Subscriptions">
        <ErrorState onRetry={() => void page.subscriptions.refetch()} />
      </PageContainer>
    );

  return (
    <PageContainer className="gap-0">
      <section className="mb-5 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary to-[#2c4a3c] px-5 py-6 text-white shadow-card sm:px-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/70">
              Recurring
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Subscriptions
            </h1>
            <p className="mt-2 text-sm text-white/80">
              ~{formatMoney(page.monthlyTotal, page.preferredCurrency)}/mo
              across {page.list.length} services
            </p>
          </div>
          <Button
            className="border-0 bg-white text-primary hover:bg-accent-soft"
            onClick={page.openCreate}
          >
            Add subscription
          </Button>
        </div>
      </section>

      {page.list.length === 0 ? (
        <EmptyState
          title="No subscriptions"
          actionLabel="Add subscription"
          onAction={page.openCreate}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {page.list.map((s) => (
            <SubscriptionCard
              key={s.id}
              subscription={s}
              onEdit={page.openEdit}
              onArchive={(id) => void page.archiveSubscription.mutateAsync(id)}
            />
          ))}
        </ul>
      )}

      <SubscriptionFormDialog
        open={page.open}
        editing={Boolean(page.editing)}
        form={page.form}
        onOpenChange={(next) => {
          if (!next) page.closeForm();
        }}
        onSubmit={page.submitForm}
      />
    </PageContainer>
  );
}

export default function SubscriptionsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer title="Subscriptions">
          <LoadingBlock />
        </PageContainer>
      }
    >
      <SubsInner />
    </Suspense>
  );
}
