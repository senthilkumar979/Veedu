"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@veedu/ui";
import { formatRelativeDue } from "@veedu/domain";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState, LoadingBlock } from "@/components/shared/states";
import { DocumentPreviewModal } from "@/components/documents/document-preview-modal";
import { useHouseholdData } from "@/lib/data";

export default function DocumentViewerPage() {
  const params = useParams<{ id: string }>();
  const { documents, replaceDocumentFile } = useHouseholdData();
  const doc = (documents.data ?? []).find((d) => d.id === params.id);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (documents.isLoading)
    return (
      <PageContainer title="Document" backHref="/documents">
        <LoadingBlock />
      </PageContainer>
    );
  if (!doc)
    return (
      <PageContainer title="Document" backHref="/documents">
        <EmptyState title="Document not found" />
      </PageContainer>
    );

  const canPreview = Boolean(doc.share_url || doc.file_path);

  return (
    <PageContainer
      title={doc.title}
      description="Household document"
      backHref="/documents"
      actions={
        <Button disabled={!canPreview} onClick={() => setPreviewOpen(true)}>
          Preview
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="flex min-h-[280px] flex-col items-start justify-center gap-4 py-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                Source
              </p>
              <p className="mt-1 text-base font-medium text-ink">
                {doc.share_url
                  ? "Adobe / share link"
                  : doc.file_name || "No file attached"}
              </p>
              {doc.share_url ? (
                <p className="mt-1 break-all text-sm text-muted">{doc.share_url}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={!canPreview}
                onClick={() => setPreviewOpen(true)}
              >
                Preview
              </Button>
              {doc.share_url ? (
                <Button
                  variant="secondary"
                  onClick={() =>
                    window.open(doc.share_url!, "_blank", "noopener")
                  }
                >
                  Open link
                </Button>
              ) : null}
              <Button
                variant="secondary"
                disabled={replaceDocumentFile.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                {doc.file_path ? "Replace file" : "Upload file"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={async (e) => {
                  const next = e.target.files?.[0];
                  if (!next) return;
                  await replaceDocumentFile.mutateAsync({
                    id: doc.id,
                    previousPath: doc.file_path,
                    file: next,
                  });
                  e.target.value = "";
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Detail label="Status">
              <Badge tone={doc.status === "valid" ? "success" : "warning"}>
                {doc.status.replace("_", " ")}
              </Badge>
            </Detail>
            <Detail label="Visibility">
              <p className="font-medium text-ink">{doc.visibility}</p>
            </Detail>
            <Detail label="Issued">
              <p className="font-medium text-ink">{doc.issued_at || "—"}</p>
            </Detail>
            <Detail label="Expires">
              <p className="font-medium text-ink">
                {doc.expires_at ? formatRelativeDue(doc.expires_at) : "—"}
              </p>
            </Detail>
            <Detail label="Notes">
              <p className="font-medium text-ink">{doc.notes || "—"}</p>
            </Detail>
          </CardContent>
        </Card>
      </div>

      <DocumentPreviewModal
        document={doc}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </PageContainer>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-subtle">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
