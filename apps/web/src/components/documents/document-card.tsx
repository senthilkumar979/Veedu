"use client";

import Link from "next/link";
import { Badge, Button, Card, CardContent } from "@veedu/ui";
import { formatRelativeDue } from "@veedu/domain";
import type { Document } from "@veedu/types";

interface DocumentCardProps {
  document: Document;
  onPreview: (doc: Document) => void;
  onArchive: (id: string) => void;
}

export function DocumentCard({
  document: d,
  onPreview,
  onArchive,
}: DocumentCardProps) {
  const canPreview = Boolean(d.share_url || d.file_path);

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col py-4">
        <Link href={`/documents/${d.id}`} className="min-w-0">
          <p className="text-base font-semibold text-ink">{d.title}</p>
          <p className="mt-1 text-sm text-muted">
            {d.category} ·{" "}
            {d.share_url ? "Share link" : d.file_name || "No file"}
          </p>
          <p className="mt-1 text-sm text-subtle">
            {d.expires_at
              ? `Expires ${formatRelativeDue(d.expires_at)}`
              : "No expiry"}
          </p>
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone={d.status === "valid" ? "success" : "warning"}>
            {d.status.replace("_", " ")}
          </Badge>
          <Badge>{d.visibility}</Badge>
        </div>
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <Button
            size="sm"
            className="h-10"
            disabled={!canPreview}
            onClick={() => onPreview(d)}
          >
            Preview
          </Button>
          <Link href={`/documents/${d.id}`}>
            <Button size="sm" variant="secondary" className="h-10">
              Details
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            className="h-10 text-danger"
            onClick={() => onArchive(d.id)}
          >
            Archive
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
