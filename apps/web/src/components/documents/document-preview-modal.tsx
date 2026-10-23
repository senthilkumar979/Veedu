"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@veedu/ui";
import { ExternalLink } from "lucide-react";
import type { Document } from "@veedu/types";
import { LoadingBlock } from "@/components/shared/states";
import { getDocumentSignedUrl } from "@/lib/document-storage";

interface DocumentPreviewModalProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentPreviewModal({
  document: doc,
  open,
  onOpenChange,
}: DocumentPreviewModalProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!open || !doc?.file_path) {
        setFileUrl(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const url = await getDocumentSignedUrl(doc.file_path);
        if (!cancelled) setFileUrl(url);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Preview failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [open, doc?.file_path]);

  const previewSrc = doc?.share_url || fileUrl;
  const isImage =
    Boolean(doc?.mime_type?.startsWith("image/")) && !doc?.share_url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-4 flex h-[calc(100dvh-2rem)] w-[min(100%-1rem,80rem)] max-w-none -translate-y-0 flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="mb-0 flex shrink-0 flex-row items-center justify-between gap-3 border-b border-border px-5 py-4 pr-14">
          <div className="min-w-0">
            <DialogTitle className="truncate">
              {doc?.title ?? "Preview"}
            </DialogTitle>
            <p className="mt-0.5 truncate text-xs text-muted">
              {doc?.share_url
                ? "Adobe / share link"
                : doc?.file_name || "Document"}
            </p>
          </div>
          {previewSrc ? (
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={() => window.open(previewSrc, "_blank", "noopener")}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </Button>
          ) : null}
        </DialogHeader>

        <div className="min-h-0 flex-1 bg-surface-subtle">
          {!doc ? null : loading ? (
            <div className="p-6">
              <LoadingBlock />
            </div>
          ) : previewSrc && isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc}
              alt={doc.title}
              className="mx-auto h-full max-h-full w-full object-contain p-4"
            />
          ) : previewSrc ? (
            <iframe
              title={doc.title}
              src={previewSrc}
              className="h-full w-full border-0 bg-surface"
              allow="fullscreen"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
              <p className="text-sm font-medium text-ink">
                {error || "Nothing to preview"}
              </p>
              <p className="max-w-sm text-xs text-muted">
                Add an Adobe share link or upload a file to preview here.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
