"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
} from "@veedu/ui";
import { placeSchema } from "@veedu/domain";
import type { Place } from "@veedu/types";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/shared/states";
import { RowActions } from "@/components/shared/row-actions";
import { useHouseholdData } from "@/lib/data";

type Values = z.infer<typeof placeSchema>;

function PlacesInner() {
  const search = useSearchParams();
  const { places, addPlace, updatePlace, archivePlace } = useHouseholdData();
  const [open, setOpen] = useState(search.get("new") === "1");
  const [editing, setEditing] = useState<Place | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(placeSchema),
    defaultValues: {
      name: "",
      address: "",
      website: "",
      rating: 5,
      category: "Weekend",
      tags: [],
      visited: false,
      visibility: "shared",
      notes: "",
    },
  });

  function openCreate() {
    setEditing(null);
    form.reset({
      name: "",
      address: "",
      website: "",
      rating: 5,
      category: "Weekend",
      tags: [],
      visited: false,
      visibility: "shared",
      notes: "",
    });
    setOpen(true);
  }

  function openEdit(p: Place) {
    setEditing(p);
    form.reset({
      name: p.name,
      address: p.address ?? "",
      website: p.website ?? "",
      rating: p.rating ?? 5,
      category: p.category,
      tags: p.tags ?? [],
      visited: p.visited,
      visibility: p.visibility,
      notes: p.notes ?? "",
    });
    setOpen(true);
  }

  if (places.isLoading)
    return (
      <PageContainer title="Places">
        <LoadingBlock />
      </PageContainer>
    );
  if (places.isError)
    return (
      <PageContainer title="Places">
        <ErrorState onRetry={() => void places.refetch()} />
      </PageContainer>
    );

  return (
    <PageContainer
      title="Places"
      description="Saved locations for weekends, travel, and revisits"
      actions={<Button onClick={openCreate}>Add place</Button>}
    >
      {(places.data ?? []).length === 0 ? (
        <EmptyState title="No places saved" actionLabel="Add place" onAction={openCreate} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(places.data ?? []).map((p) => (
            <Card key={p.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-ink">{p.name}</p>
                    <p className="text-xs text-muted">{p.address || "No address"}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge tone="primary">{p.category}</Badge>
                    <RowActions
                      onEdit={() => openEdit(p)}
                      onArchive={() => void archivePlace.mutateAsync(p.id)}
                    />
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {p.rating ? `Rating ${p.rating}/5` : "Unrated"} ·{" "}
                  {p.visited ? "Visited" : "Wishlist"}
                </p>
                <p className="mt-1 text-xs text-subtle">{p.notes}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit place" : "Add place"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit(async (values) => {
              const payload = {
                ...values,
                website: values.website || null,
                tags: values.tags ?? [],
              };
              if (editing) {
                await updatePlace.mutateAsync({ id: editing.id, patch: payload });
              } else {
                await addPlace.mutateAsync(payload);
              }
              setOpen(false);
              setEditing(null);
              form.reset();
            })}
          >
            <Input label="Name" {...form.register("name")} />
            <Input label="Address" {...form.register("address")} />
            <Select
              label="Category"
              value={form.watch("category")}
              onValueChange={(v) => form.setValue("category", v)}
              options={["Weekend", "Travel", "Food", "Shopping", "Family", "Other"].map(
                (c) => ({ value: c, label: c }),
              )}
            />
            <Input label="Notes" {...form.register("notes")} />
            <Button type="submit" className="w-full">
              {editing ? "Save changes" : "Save"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

export default function PlacesPage() {
  return (
    <Suspense
      fallback={
        <PageContainer title="Places">
          <LoadingBlock />
        </PageContainer>
      }
    >
      <PlacesInner />
    </Suspense>
  );
}
