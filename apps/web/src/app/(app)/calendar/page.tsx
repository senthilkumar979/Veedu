"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from "@veedu/ui";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/shared/states";
import { useHouseholdData } from "@/lib/data";

export default function CalendarPage() {
  const { events } = useHouseholdData();
  const [cursor, setCursor] = useState(new Date());
  const [view, setView] = useState("agenda");

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor);
    return eachDayOfInterval({ start, end: endOfWeek(cursor) });
  }, [cursor]);

  const sorted = useMemo(
    () => [...(events.data ?? [])].sort((a, b) => a.start_at.localeCompare(b.start_at)),
    [events.data],
  );

  if (events.isLoading) return <PageContainer title="Calendar"><LoadingBlock /></PageContainer>;
  if (events.isError) return <PageContainer title="Calendar"><ErrorState onRetry={() => void events.refetch()} /></PageContainer>;

  return (
    <PageContainer title="Calendar" description="Agenda first · Month and Week available">
      <Tabs value={view} onValueChange={setView}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setCursor(addDays(cursor, view === "month" ? -30 : -7))}>Prev</Button>
            <Button variant="ghost" size="sm" onClick={() => setCursor(new Date())}>Today</Button>
            <Button variant="secondary" size="sm" onClick={() => setCursor(addDays(cursor, view === "month" ? 30 : 7))}>Next</Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>{format(cursor, "MMMM yyyy")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-subtle">
                {["M","T","W","T","F","S","S"].map((d, i) => <span key={i}>{d}</span>)}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {monthDays.map((day) => {
                  const has = sorted.some((e) => isSameDay(new Date(e.start_at), day));
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => setCursor(day)}
                      className={`relative h-8 rounded-md text-xs ${isSameDay(day, cursor) ? "bg-primary text-white" : isSameMonth(day, cursor) ? "text-ink hover:bg-surface-hover" : "text-disabled"}`}
                    >
                      {format(day, "d")}
                      {has ? <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current opacity-70" /> : null}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div>
            <TabsContent value="agenda" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>{format(cursor, "EEEE, d MMMM")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sorted.filter((e) => isSameDay(new Date(e.start_at), cursor)).length === 0 ? (
                    <EmptyState title="Nothing on the agenda" description="Enjoy the open day." />
                  ) : (
                    sorted.filter((e) => isSameDay(new Date(e.start_at), cursor)).map((e) => (
                      <div key={e.id} className="flex gap-3 rounded-lg border border-border p-3">
                        <span className="w-14 text-sm font-medium text-muted">{format(new Date(e.start_at), "HH:mm")}</span>
                        <div>
                          <p className="text-sm font-medium text-ink">{e.title}</p>
                          <p className="text-xs text-muted">{e.location || "No location"}</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="week" className="mt-0">
              <div className="grid gap-2 md:grid-cols-7">
                {weekDays.map((day) => (
                  <Card key={day.toISOString()}>
                    <CardHeader className="px-3 pt-3">
                      <CardTitle className="text-xs">{format(day, "EEE d")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 px-3 pb-3">
                      {sorted.filter((e) => isSameDay(new Date(e.start_at), day)).map((e) => (
                        <div key={e.id} className="rounded-md bg-primary-soft px-2 py-1 text-[11px] text-primary">
                          {format(new Date(e.start_at), "HH:mm")} {e.title}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="month" className="mt-0">
              <Card>
                <CardContent className="grid grid-cols-7 gap-px bg-border p-px">
                  {monthDays.map((day) => (
                    <div key={day.toISOString()} className={`min-h-24 bg-surface p-2 ${isSameMonth(day, cursor) ? "" : "opacity-40"}`}>
                      <p className="text-xs font-medium text-muted">{format(day, "d")}</p>
                      {sorted.filter((e) => isSameDay(new Date(e.start_at), day)).slice(0, 2).map((e) => (
                        <p key={e.id} className="mt-1 truncate text-[10px] text-ink">{e.title}</p>
                      ))}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </PageContainer>
  );
}
