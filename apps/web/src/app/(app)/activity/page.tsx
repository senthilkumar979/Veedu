"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent } from "@veedu/ui";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/shared/states";
import { useHouseholdData } from "@/lib/data";

const actionLabel: Record<string, string> = {
  uploaded: "uploaded",
  opened: "opened",
  downloaded: "downloaded",
  replaced: "replaced",
  archived: "archived",
};

export default function ActivityPage() {
  const { documentActivities, documents, members } = useHouseholdData();

  const rows = useMemo(() => {
    const docs = new Map((documents.data ?? []).map((d) => [d.id, d.title]));
    const people = new Map(
      (members.data ?? []).map((m) => [
        m.user_id,
        m.display_name || m.profiles?.full_name || m.profiles?.email || "Member",
      ]),
    );
    return (documentActivities.data ?? []).map((a) => ({
      ...a,
      docTitle: docs.get(a.document_id) || "Document",
      who: people.get(a.user_id) || "Someone",
    }));
  }, [documentActivities.data, documents.data, members.data]);

  if (documentActivities.isLoading)
    return (
      <PageContainer title="Activity log" backHref="/documents">
        <LoadingBlock />
      </PageContainer>
    );
  if (documentActivities.isError)
    return (
      <PageContainer title="Activity log" backHref="/documents">
        <ErrorState onRetry={() => void documentActivities.refetch()} />
      </PageContainer>
    );

  return (
    <PageContainer
      title="Activity log"
      description="Who uploaded, opened, downloaded, or replaced documents — and when."
      backHref="/documents"
    >
      {rows.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="Document actions will appear here."
        />
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.id}>
              <Card>
                <CardContent className="py-3 text-sm">
                  <p className="text-ink">
                    <span className="font-medium">{row.who}</span>{" "}
                    {actionLabel[row.action] ?? row.action}{" "}
                    <Link
                      href={`/documents/${row.document_id}`}
                      className="font-medium underline"
                    >
                      {row.docTitle}
                    </Link>
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {format(new Date(row.created_at), "d MMM yyyy · HH:mm")}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
