"use client";

import { Suspense } from "react";
import { Button, Input } from "@veedu/ui";
import { CONTACT_CATEGORIES } from "@veedu/types";
import { PageContainer } from "@/components/layout/page-container";
import { ErrorState, LoadingBlock } from "@/components/shared/states";
import {
  ContactDirectory,
  type ContactsView,
} from "@/components/contacts/contact-directory";
import { ContactFormDialog } from "@/components/contacts/contact-form-dialog";
import { ContactsBulkBar } from "@/components/contacts/contacts-bulk-bar";
import { useContactsPage } from "@/components/contacts/use-contacts-page";

function ContactsInner() {
  const page = useContactsPage();

  if (page.contacts.isLoading)
    return (
      <PageContainer title="Contacts">
        <LoadingBlock />
      </PageContainer>
    );
  if (page.contacts.isError)
    return (
      <PageContainer title="Contacts">
        <ErrorState onRetry={() => void page.contacts.refetch()} />
      </PageContainer>
    );

  return (
    <PageContainer className="gap-0">
      <section className="mb-5 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-5 shadow-card sm:px-6">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-accent">
            Directory
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">
            Contacts
          </h1>
          <p className="mt-1 text-sm text-muted">
            {(page.contacts.data ?? []).length} people · categorize &amp; bulk-update
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(["list", "grid", "grouped"] as ContactsView[]).map((v) => (
            <Button
              key={v}
              size="sm"
              variant={page.view === v ? "primary" : "secondary"}
              className="h-9 rounded-pill capitalize"
              onClick={() => page.setView(v)}
            >
              {v}
            </Button>
          ))}
          <Button onClick={page.openCreate}>Add contact</Button>
        </div>
      </section>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-card">
        <div className="min-w-[14rem] flex-1 max-w-md">
          <Input
            placeholder="Search name, email, category…"
            value={page.q}
            onChange={(e) => page.setQ(e.target.value)}
            aria-label="Search contacts"
          />
        </div>
        <ContactsBulkBar
          selectedCount={page.selectedIds.size}
          bulkCategory={page.bulkCategory}
          onBulkCategoryChange={page.setBulkCategory}
          onApply={() => void page.applyBulkCategory()}
          onCancel={() => page.setSelectedIds(new Set())}
        />
      </div>

      <ContactDirectory
        contacts={page.list}
        view={page.view}
        category={page.category}
        selectedIds={page.selectedIds}
        onCategoryChange={page.setCategory}
        onToggleSelect={page.toggleSelect}
        onSelectAll={(ids) => page.setSelectedIds(new Set(ids))}
        onClearSelection={() => page.setSelectedIds(new Set())}
        categories={CONTACT_CATEGORIES}
        onEdit={page.openEdit}
        onArchive={(id) => void page.archiveContact.mutateAsync(id)}
        onCreate={page.openCreate}
      />

      <ContactFormDialog
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

export default function ContactsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer title="Contacts">
          <LoadingBlock />
        </PageContainer>
      }
    >
      <ContactsInner />
    </Suspense>
  );
}
