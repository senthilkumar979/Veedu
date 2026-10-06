"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge, Button, Card, CardContent, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Select } from "@veedu/ui";
import { contactSchema } from "@veedu/domain";
import { CONTACT_CATEGORIES } from "@veedu/types";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/shared/states";
import { useHouseholdData } from "@/lib/data";

type Values = z.infer<typeof contactSchema>;

function ContactsInner() {
  const search = useSearchParams();
  const { contacts, addContact } = useHouseholdData();
  const [open, setOpen] = useState(search.get("new") === "1");
  const [q, setQ] = useState("");
  const form = useForm<Values>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", phone: "", email: "", address: "", category: "Family", visibility: "shared", notes: "" },
  });

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (contacts.data ?? []).filter((c) => !query || c.name.toLowerCase().includes(query) || c.category.toLowerCase().includes(query));
  }, [contacts.data, q]);

  if (contacts.isLoading) return <PageContainer title="Contacts"><LoadingBlock /></PageContainer>;
  if (contacts.isError) return <PageContainer title="Contacts"><ErrorState onRetry={() => void contacts.refetch()} /></PageContainer>;

  return (
    <PageContainer title="Contacts" description="Household-focused directory" actions={<Button onClick={() => setOpen(true)}>Add contact</Button>}>
      <div className="mb-4 max-w-sm"><Input placeholder="Search contacts…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search contacts" /></div>
      {list.length === 0 ? (
        <EmptyState title="No contacts" actionLabel="Add contact" onAction={() => setOpen(true)} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((c) => (
            <Card key={c.id}><CardContent className="py-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink">{c.name}</p>
                  <p className="text-xs text-muted">{c.notes || c.category}</p>
                </div>
                <Badge>{c.category}</Badge>
              </div>
              <p className="mt-3 text-sm text-ink">{c.phone || "No phone"}</p>
              <p className="text-sm text-muted">{c.email || "No email"}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" disabled>Call</Button>
                <Button size="sm" variant="secondary" disabled>Message</Button>
                <Button size="sm" variant="secondary" disabled>Email</Button>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add contact</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={form.handleSubmit(async (values) => { await addContact.mutateAsync({ ...values, email: values.email || null }); setOpen(false); form.reset(); })}>
            <Input label="Name" {...form.register("name")} />
            <Input label="Phone" {...form.register("phone")} />
            <Input label="Email" type="email" {...form.register("email")} />
            <Select label="Category" value={form.watch("category")} onValueChange={(v) => form.setValue("category", v)} options={CONTACT_CATEGORIES.map((c)=>({value:c,label:c}))} />
            <Input label="Notes" {...form.register("notes")} />
            <Button type="submit" className="w-full">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

export default function ContactsPage() {
  return <Suspense fallback={<PageContainer title="Contacts"><LoadingBlock /></PageContainer>}><ContactsInner /></Suspense>;
}
