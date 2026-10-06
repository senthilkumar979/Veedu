"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Tabs, TabsContent, TabsList, TabsTrigger } from "@veedu/ui";
import { homeItemSchema, homeServiceSchema, formatRelativeDue } from "@veedu/domain";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/shared/states";
import { useHouseholdData } from "@/lib/data";

type ItemValues = z.infer<typeof homeItemSchema>;
type ServiceValues = z.infer<typeof homeServiceSchema>;

export default function HomePage() {
  const { homeItems, homeServices, addHomeItem, addHomeService } = useHouseholdData();
  const [itemOpen, setItemOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const itemForm = useForm<ItemValues>({ resolver: zodResolver(homeItemSchema), defaultValues: { name: "", category: "Appliances", purchased_at: "", warranty_until: "", visibility: "shared", notes: "" } });
  const serviceForm = useForm<ServiceValues>({ resolver: zodResolver(homeServiceSchema), defaultValues: { name: "", provider: "", last_serviced_at: "", next_due_at: "", visibility: "shared", notes: "" } });

  if (homeItems.isLoading || homeServices.isLoading) return <PageContainer title="Home"><LoadingBlock /></PageContainer>;
  if (homeItems.isError || homeServices.isError) return <PageContainer title="Home"><ErrorState onRetry={() => { void homeItems.refetch(); void homeServices.refetch(); }} /></PageContainer>;

  return (
    <PageContainer title="Home" description="Inventory, warranties, and maintenance">
      <Tabs defaultValue="maintenance">
        <TabsList>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        <TabsContent value="maintenance">
          <div className="mb-3 flex justify-end"><Button onClick={() => setServiceOpen(true)}>Add service</Button></div>
          {(homeServices.data ?? []).length === 0 ? (
            <EmptyState title="No maintenance tracked" actionLabel="Add service" onAction={() => setServiceOpen(true)} />
          ) : (
            <ul className="space-y-2">
              {(homeServices.data ?? []).map((s) => (
                <li key={s.id}><Card><CardContent className="flex items-center justify-between gap-3 py-4">
                  <div>
                    <p className="text-sm font-medium text-ink">{s.name}</p>
                    <p className="text-xs text-muted">{s.provider || "No provider"} · Last {s.last_serviced_at || "—"}</p>
                  </div>
                  {s.next_due_at ? <Badge tone="warning">Due {formatRelativeDue(s.next_due_at)}</Badge> : <Badge>No due</Badge>}
                </CardContent></Card></li>
              ))}
            </ul>
          )}
        </TabsContent>
        <TabsContent value="inventory">
          <div className="mb-3 flex justify-end"><Button onClick={() => setItemOpen(true)}>Add item</Button></div>
          {(homeItems.data ?? []).length === 0 ? (
            <EmptyState title="No home items" actionLabel="Add item" onAction={() => setItemOpen(true)} />
          ) : (
            <ul className="space-y-2">
              {(homeItems.data ?? []).map((item) => (
                <li key={item.id}><Card><CardContent className="py-4">
                  <p className="text-sm font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-muted">{item.category} · Purchased {item.purchased_at || "—"} · Warranty {item.warranty_until || "—"}</p>
                </CardContent></Card></li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={itemOpen} onOpenChange={setItemOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add home item</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={itemForm.handleSubmit(async (values) => { await addHomeItem.mutateAsync(values); setItemOpen(false); itemForm.reset(); })}>
            <Input label="Name" {...itemForm.register("name")} />
            <Input label="Category" {...itemForm.register("category")} />
            <Input label="Purchased" type="date" {...itemForm.register("purchased_at")} />
            <Input label="Warranty until" type="date" {...itemForm.register("warranty_until")} />
            <Button type="submit" className="w-full">Save</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={serviceOpen} onOpenChange={setServiceOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add maintenance service</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={serviceForm.handleSubmit(async (values) => { await addHomeService.mutateAsync(values); setServiceOpen(false); serviceForm.reset(); })}>
            <Input label="Name" {...serviceForm.register("name")} />
            <Input label="Provider" {...serviceForm.register("provider")} />
            <Input label="Last serviced" type="date" {...serviceForm.register("last_serviced_at")} />
            <Input label="Next due" type="date" {...serviceForm.register("next_due_at")} />
            <Button type="submit" className="w-full">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
