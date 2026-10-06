"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@veedu/ui";
import {
  buildAttentionItems,
  formatMoney,
  formatRelativeDue,
  greetingForHour,
  stubWeather,
  taskProgress,
} from "@veedu/domain";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/shared/states";
import { useAuth } from "@/lib/auth";
import { useHouseholdData } from "@/lib/data";

export default function DashboardPage() {
  const { profile, household } = useAuth();
  const {
    tasks,
    events,
    bills,
    subscriptions,
    documents,
    importantDates,
  } = useHouseholdData();

  const loading =
    tasks.isLoading ||
    events.isLoading ||
    bills.isLoading ||
    documents.isLoading;
  const error =
    tasks.isError || events.isError || bills.isError || documents.isError;

  const attention = useMemo(
    () =>
      buildAttentionItems({
        documents: documents.data ?? [],
        bills: bills.data ?? [],
        tasks: tasks.data ?? [],
        subscriptions: subscriptions.data ?? [],
        importantDates: importantDates.data ?? [],
      }),
    [documents.data, bills.data, tasks.data, subscriptions.data, importantDates.data],
  );

  const weather = stubWeather(
    household?.home_location ?? "Home",
    household?.parents_location ?? "Parents",
  );

  const todayEvents = useMemo(() => {
    const day = format(new Date(), "yyyy-MM-dd");
    return (events.data ?? [])
      .filter((e) => e.start_at.startsWith(day) || format(new Date(e.start_at), "yyyy-MM-dd") === day)
      .sort((a, b) => a.start_at.localeCompare(b.start_at));
  }, [events.data]);

  const progress = taskProgress(tasks.data ?? []);
  const openTasks = (tasks.data ?? [])
    .filter((t) => t.status !== "done" && t.status !== "cancelled")
    .slice(0, 5);
  const upcomingPayments = [...(bills.data ?? []), ...(subscriptions.data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    amount: s.amount,
    currency: s.currency,
    due_date: s.next_renewal,
  }))].sort((a, b) => a.due_date.localeCompare(b.due_date)).slice(0, 4);

  const greeting = greetingForHour(
    new Date().getHours(),
    profile?.full_name ?? "there",
  );

  if (loading) {
    return (
      <PageContainer title="Dashboard" description="Loading your household…">
        <LoadingBlock rows={5} />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Dashboard">
        <ErrorState
          title="We couldn't load your dashboard"
          onRetry={() => {
            void tasks.refetch();
            void events.refetch();
            void bills.refetch();
            void documents.refetch();
          }}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={greeting}
      description={`Everything important in one view · ${format(new Date(), "EEEE, d MMMM yyyy")}`}
    >
      {attention.length > 0 ? (
        <Card className="mb-4 border-warning/30 bg-warning-soft/40">
          <CardHeader>
            <CardTitle>Attention</CardTitle>
            <Badge tone="warning">
              {attention.length} item{attention.length === 1 ? "" : "s"} need
              your attention
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {attention.slice(0, 4).map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-surface"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <p className="text-xs text-muted">{item.detail}</p>
                </div>
                <Badge
                  tone={
                    item.priority === "critical" || item.priority === "high"
                      ? "danger"
                      : "neutral"
                  }
                >
                  {item.priority}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weather</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[weather.home, weather.parents].map((w, idx) => (
              <div
                key={w.location_label}
                className="rounded-lg bg-surface-subtle p-3"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
                  {idx === 0 ? "Home" : "Parents"}
                </p>
                <p className="mt-1 text-2xl font-semibold text-ink">
                  {w.temperature_c}°
                </p>
                <p className="text-sm text-muted">{w.condition}</p>
                <p className="text-xs text-subtle">
                  Feels like {w.feels_like_c}° · {w.location_label}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today</CardTitle>
            <Link href="/calendar" className="text-sm text-primary">
              Agenda
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayEvents.length === 0 ? (
              <p className="text-sm text-muted">No events scheduled today.</p>
            ) : (
              todayEvents.map((e) => (
                <div key={e.id} className="flex gap-3 text-sm">
                  <span className="w-12 shrink-0 font-medium text-muted">
                    {format(new Date(e.start_at), "HH:mm")}
                  </span>
                  <span className="text-ink">{e.title}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <Badge tone="primary">{progress.open} open</Badge>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-muted">
                {progress.overdue > 0
                  ? `${progress.overdue} overdue`
                  : "On track"}
              </span>
              <span className="font-medium text-ink">{progress.percent}%</span>
            </div>
            <div className="mb-4 h-2 overflow-hidden rounded-pill bg-surface-subtle">
              <div
                className="h-full rounded-pill bg-primary transition-all duration-slow"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <ul className="space-y-2">
              {openTasks.map((t) => (
                <li key={t.id} className="flex items-start justify-between gap-2 text-sm">
                  <span className="text-ink">{t.title}</span>
                  <span className="shrink-0 text-xs text-muted">
                    {t.due_date ? formatRelativeDue(t.due_date) : "No due"}
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/tasks" className="mt-3 inline-block text-sm text-primary">
              View all tasks
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming payments</CardTitle>
            <Link href="/bills" className="text-sm text-primary">
              Bills
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingPayments.length === 0 ? (
              <EmptyState title="No upcoming payments" description="You're all caught up." />
            ) : (
              upcomingPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-muted">
                      {formatRelativeDue(p.due_date)}
                    </p>
                  </div>
                  <p className="font-medium text-ink">
                    {formatMoney(p.amount, p.currency)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <Link href="/documents" className="text-sm text-primary">
            Vault
          </Link>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {(documents.data ?? []).slice(0, 3).map((d) => (
            <Link
              key={d.id}
              href={`/documents/${d.id}`}
              className="rounded-lg border border-border p-3 hover:bg-surface-hover"
            >
              <p className="text-sm font-medium text-ink">{d.title}</p>
              <p className="mt-1 text-xs text-muted">
                {d.expires_at
                  ? `Expires ${formatRelativeDue(d.expires_at)}`
                  : "No expiry"}
              </p>
              <Badge
                className="mt-2"
                tone={
                  d.status === "expired" || d.status === "expiring_soon"
                    ? "warning"
                    : "success"
                }
              >
                {d.status.replace("_", " ")}
              </Badge>
            </Link>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
