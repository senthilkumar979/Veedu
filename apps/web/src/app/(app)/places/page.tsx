"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge, Button, Card, CardContent, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Select } from "@veedu/ui";
import { placeSchema } from "@veedu/domain";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/shared/states";
import { useHouseholdData } from "@/lib/data";

type Values = z.infer<typeof placeSchema>;

function PlacesInner() {
  const search = useSearchParams();
  const { places, addPlace } = useHouseholdData();
  const [open, setOpen] = useState(search.get("new") === "1");
  const form = useForm<Values>({
    resolver: zodResolver(placeSchema),
    defaultValues: { name: "", address: "", website: "", rating: 5, category: "Weekend", tags: [], visited: false, visibility: "shared", notes: "" },
  });

  if (places.isLoading) return <PageContainer title="Places"><LoadingBlock /></PageContainer>;
  if (places.isError) return <PageContainer title="Places"><ErrorState onRetry={() => void places.refetch()} /></PageContainer>;

  return (
    <PageContainer title="Places" description="Saved locations for weekends, travel, and revisits" actions={<Button onClick={() => setOpen(true)}>Add place</Button>}>
      {(places.data ?? []).length === 0 ? (
        <EmptyState title="No places saved" actionLabel="Add place" onAction={() => setOpen(true)} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(places.data ?? []).map((p) => (
            <Card key={p.id}><CardContent className="py-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink">{p.name}</p>
                  <p className="text-xs text-muted">{p.address || "No address"}</p>
                </div>
                <Badge tone="primary">{p.category}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted">{p.rating ? `Rating ${p.rating}/5` : "Unrated"} · {p.visited ? "Visited" : "Wishlist"}</p>
              <p className="mt-1 text-xs text-subtle">{p.notes}</p>
            </CardContent></Card>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add place</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={form.handleSubmit(async (values) => { await addPlace.mutateAsync({ ...values, website: values.website || null, tags: values.tags ?? [] }); setOpen(false); form.reset(); })}>
            <Input label="Name" {...form.register("name")} />
            <Input label="Address" {...form.register("address")} />
            <Select label="Category" value={form.watch("category")} onValueChange={(v) => form.setValue("category", v)} options={["Weekend","Travel","Food","Shopping","Family","Other"].map((c)=>({value:c,label:c}))} />
            <Input label="Notes" {...form.register("notes")} />
            <Button type="submit" className="w-full">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

export default function PlacesPage() {
  return <Suspense fallback={<PageContainer title="Places"><LoadingBlock /></PageContainer>}><PlacesInner /></Suspense>;
}
