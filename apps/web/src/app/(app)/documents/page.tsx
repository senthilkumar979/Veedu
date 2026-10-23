"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@veedu/ui";
import { documentSchema } from "@veedu/domain";
import type { Document } from "@veedu/types";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/shared/states";
import { DocumentCard } from "@/components/documents/document-card";
import { DocumentFormDialog } from "@/components/documents/document-form-dialog";
import { DocumentPreviewModal } from "@/components/documents/document-preview-modal";
import { useHouseholdData } from "@/lib/data";

type Values = z.infer<typeof documentSchema>;

function DocsInner() {
  const search = useSearchParams();
  const { documents, addDocument, archiveDocument } = useHouseholdData();
  const [open, setOpen] = useState(search.get("new") === "1");
  const [filter, setFilter] = useState("All");
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: "",
      category: "Identity",
      status: "valid",
      issued_at: "",
      expires_at: "",
      share_url: "",
      visibility: "shared",
      notes: "",
    },
  });

  const list = useMemo(() => {
    const rows = documents.data ?? [];
    if (filter === "Expiring")
      return rows.filter((d) => d.status === "expiring_soon");
    if (filter === "Expired") return rows.filter((d) => d.status === "expired");
    if (filter === "Shared") return rows.filter((d) => d.visibility === "shared");
    if (filter === "Personal")
      return rows.filter((d) => d.visibility === "private");
    return rows;
  }, [documents.data, filter]);

  if (documents.isLoading)
    return (
      <PageContainer title="Documents">
        <LoadingBlock />
      </PageContainer>
    );
  if (documents.isError)
    return (
      <PageContainer title="Documents">
        <ErrorState onRetry={() => void documents.refetch()} />
      </PageContainer>
    );

  return (
    <PageContainer
      title="Documents"
      description="Share Adobe links or upload files to your household vault"
      actions={
        <>
          <Link href="/activity">
            <Button variant="secondary">Activity log</Button>
          </Link>
          <Button onClick={() => setOpen(true)}>Add document</Button>
        </>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-border bg-surface px-4 py-3 shadow-card">
        {["All", "Expiring", "Expired", "Shared", "Personal"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`min-h-12 rounded-pill px-4 text-sm font-medium ${
              filter === f
                ? "bg-primary text-white"
                : "border border-border bg-surface-subtle text-muted"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="No documents"
          description="Paste an Adobe share link or upload a file."
          actionLabel="Add document"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d) => (
            <DocumentCard
              key={d.id}
              document={d}
              onPreview={setPreviewDoc}
              onArchive={(id) => void archiveDocument.mutateAsync(id)}
            />
          ))}
        </div>
      )}

      <DocumentFormDialog
        open={open}
        form={form}
        pending={addDocument.isPending}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) form.reset();
        }}
        onSubmit={async (values, file) => {
          await addDocument.mutateAsync({
            ...values,
            share_url: values.share_url || null,
            file: file ?? undefined,
          });
          setOpen(false);
          form.reset();
        }}
      />

      <DocumentPreviewModal
        document={previewDoc}
        open={Boolean(previewDoc)}
        onOpenChange={(next) => {
          if (!next) setPreviewDoc(null);
        }}
      />
    </PageContainer>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer title="Documents">
          <LoadingBlock />
        </PageContainer>
      }
    >
      <DocsInner />
    </Suspense>
  );
}
