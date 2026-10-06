"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@veedu/ui";
import { formatRelativeDue } from "@veedu/domain";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState, LoadingBlock } from "@/components/shared/states";
import { useHouseholdData } from "@/lib/data";

export default function DocumentViewerPage() {
  const params = useParams<{ id: string }>();
  const { documents } = useHouseholdData();
  const doc = (documents.data ?? []).find((d) => d.id === params.id);

  if (documents.isLoading) return <PageContainer title="Document"><LoadingBlock /></PageContainer>;
  if (!doc) return <PageContainer title="Document"><EmptyState title="Document not found" /></PageContainer>;

  return (
    <PageContainer title={doc.title} description="Focused document viewer" actions={<Link href="/documents"><Button variant="secondary">Back</Button></Link>}>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="min-h-[420px]">
          <CardContent className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-xl border border-dashed border-border bg-surface-subtle px-10 py-16">
              <p className="text-sm font-medium text-ink">{doc.file_name || "No file attached"}</p>
              <p className="mt-2 max-w-sm text-xs text-muted">
                Preview connects to Supabase Storage at {doc.file_path || "households/{id}/documents/{doc}/"}. Demo mode shows metadata only.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" disabled>Download</Button>
              <Button variant="secondary" disabled>Replace</Button>
              <Button variant="ghost" disabled>Rename</Button>
              <Button variant="danger" disabled>Delete</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><p className="text-xs text-subtle">Status</p><Badge tone={doc.status === "valid" ? "success" : "warning"}>{doc.status.replace("_"," ")}</Badge></div>
            <div><p className="text-xs text-subtle">Visibility</p><p className="text-ink">{doc.visibility}</p></div>
            <div><p className="text-xs text-subtle">Issued</p><p className="text-ink">{doc.issued_at || "—"}</p></div>
            <div><p className="text-xs text-subtle">Expires</p><p className="text-ink">{doc.expires_at ? formatRelativeDue(doc.expires_at) : "—"}</p></div>
            <div><p className="text-xs text-subtle">Notes</p><p className="text-ink">{doc.notes || "—"}</p></div>
            <div><p className="text-xs text-subtle">Storage path</p><p className="break-all text-xs text-muted">{doc.file_path}</p></div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
