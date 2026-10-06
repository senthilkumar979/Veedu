"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge, Button, Card, CardContent, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Select } from "@veedu/ui";
import { documentSchema, formatRelativeDue } from "@veedu/domain";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/shared/states";
import { useHouseholdData } from "@/lib/data";

type Values = z.infer<typeof documentSchema>;

function DocsInner() {
  const search = useSearchParams();
  const { documents, addDocument } = useHouseholdData();
  const [open, setOpen] = useState(search.get("new") === "1");
  const [filter, setFilter] = useState("All");
  const form = useForm<Values>({
    resolver: zodResolver(documentSchema),
    defaultValues: { title: "", category: "Identity", status: "valid", issued_at: "", expires_at: "", visibility: "shared", notes: "" },
  });

  const list = useMemo(() => {
    const rows = documents.data ?? [];
    if (filter === "All") return rows;
    if (filter === "Expiring") return rows.filter((d) => d.status === "expiring_soon");
    if (filter === "Expired") return rows.filter((d) => d.status === "expired");
    if (filter === "Shared") return rows.filter((d) => d.visibility === "shared");
    if (filter === "Personal") return rows.filter((d) => d.visibility === "private");
    return rows;
  }, [documents.data, filter]);

  if (documents.isLoading) return <PageContainer title="Documents"><LoadingBlock /></PageContainer>;
  if (documents.isError) return <PageContainer title="Documents"><ErrorState onRetry={() => void documents.refetch()} /></PageContainer>;

  return (
    <PageContainer title="Documents" description="Lightweight household document vault" actions={<Button onClick={() => setOpen(true)}>Upload document</Button>}>
      <div className="mb-4 flex flex-wrap gap-2">
        {["All","Expiring","Expired","Shared","Personal"].map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-pill px-3 py-1.5 text-xs font-medium ${filter===f?"bg-primary text-white":"border border-border bg-surface text-muted"}`}>{f}</button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState title="No documents" description="Drag-and-drop or select files when Supabase Storage is connected." actionLabel="Add document" onAction={() => setOpen(true)} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d) => (
            <Link key={d.id} href={`/documents/${d.id}`}>
              <Card className="h-full hover:bg-surface-hover">
                <CardContent className="py-4">
                  <p className="text-sm font-semibold text-ink">{d.title}</p>
                  <p className="mt-1 text-xs text-muted">{d.category} · {d.file_name || "No file"}</p>
                  <p className="mt-1 text-xs text-subtle">{d.expires_at ? `Expires ${formatRelativeDue(d.expires_at)}` : "No expiry"}</p>
                  <div className="mt-3 flex gap-2">
                    <Badge tone={d.status === "valid" ? "success" : "warning"}>{d.status.replace("_"," ")}</Badge>
                    <Badge>{d.visibility}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add document</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={form.handleSubmit(async (values) => { await addDocument.mutateAsync(values); setOpen(false); form.reset(); })}>
            <Input label="Title" {...form.register("title")} />
            <Select label="Category" value={form.watch("category") ?? "Other"} onValueChange={(v) => form.setValue("category", v)} options={["Identity","Housing","Insurance","Vehicle","Other"].map((c)=>({value:c,label:c}))} />
            <Input label="Issued" type="date" {...form.register("issued_at")} />
            <Input label="Expires" type="date" {...form.register("expires_at")} />
            <Input label="Notes" {...form.register("notes")} />
            <p className="text-xs text-muted">Storage path: households/{"{id}"}/documents/{"{doc}"}/ — wired for Supabase Storage when env is present.</p>
            <Button type="submit" className="w-full">Save metadata</Button>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

export default function DocumentsPage() {
  return <Suspense fallback={<PageContainer title="Documents"><LoadingBlock /></PageContainer>}><DocsInner /></Suspense>;
}
