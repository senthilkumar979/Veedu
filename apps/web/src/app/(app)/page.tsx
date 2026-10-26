"use client";

import { useMemo } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { daysUntil, greetingForHour } from "@veedu/domain";
import { PageContainer } from "@/components/layout/page-container";
import { ErrorState, LoadingBlock } from "@/components/shared/states";
import { ComingUpBoard } from "@/components/dashboard/coming-up-board";
import { OverviewMetrics } from "@/components/dashboard/overview-metrics";
import { PaymentBoard, collectUpcomingPayments } from "@/components/dashboard/payment-board";
import { TaskBoard } from "@/components/dashboard/task-board";
import { WeatherBoard, type WeatherPlace } from "@/components/dashboard/weather-board";
import { WeekCalendar } from "@/components/dashboard/week-calendar";
import { useWeather } from "@/hooks/use-weather";
import { useAuth } from "@/lib/auth";
import { useHouseholdData } from "@/lib/data";
import { resolveParentLocations } from "@/lib/household/parent-locations";

export default function DashboardPage() {
  const { profile, household } = useAuth();
  const { tasks, events, bills, subscriptions } = useHouseholdData();
  const parentPlaces = resolveParentLocations(household);
  const weatherQuery = useWeather(household?.home_location, parentPlaces);

  const loading =
    tasks.isLoading || events.isLoading || bills.isLoading || subscriptions.isLoading;
  const error =
    tasks.isError || events.isError || bills.isError || subscriptions.isError;

  const weekEvents = useMemo(() => {
    return [...(events.data ?? [])].sort((a, b) => a.start_at.localeCompare(b.start_at));
  }, [events.data]);

  const todayEvents = weekEvents.filter((event) =>
    isSameDay(parseISO(event.start_at), new Date()),
  ).length;
  const openTasks = (tasks.data ?? []).filter(
    (task) => !task.archived_at && task.status !== "done" && task.status !== "cancelled",
  );
  const overdueTasks = openTasks.filter(
    (task) => task.due_date && daysUntil(task.due_date) < 0,
  ).length;
  const payments = collectUpcomingPayments(bills.data ?? [], subscriptions.data ?? []);

  const homeError = weatherQuery.isError
    ? "Weather unavailable"
    : weatherQuery.data?.home.error;
  const parentRows = weatherQuery.data?.parents ?? [];
  const places: WeatherPlace[] = [
    {
      label: "Home",
      snapshot: weatherQuery.data?.home.snapshot,
      error: homeError,
      isLoading: weatherQuery.isLoading,
    },
    ...(parentRows.length > 0
      ? parentRows.map((row) => ({
          label: row.label || "Parents",
          snapshot: row.snapshot,
          error: weatherQuery.isError ? "Weather unavailable" : row.error,
          isLoading: weatherQuery.isLoading,
        }))
      : parentPlaces.map((place) => ({
          label: place.label,
          snapshot: null,
          error: weatherQuery.isError ? "Weather unavailable" : undefined,
          isLoading: weatherQuery.isLoading,
        }))),
  ];

  if (loading) {
    return (
      <PageContainer>
        <LoadingBlock rows={4} />
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
            void subscriptions.refetch();
          }}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-ink">
            {greetingForHour(new Date().getHours(), profile?.full_name ?? "there")}
          </h1>
          <p className="truncate text-sm text-muted">{household?.name ?? "Household"}</p>
        </div>
        <p className="shrink-0 text-sm text-muted">{format(new Date(), "EEE d MMM")}</p>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-span">
          <OverviewMetrics
            todayEvents={todayEvents}
            openTasks={openTasks.length}
            overdueTasks={overdueTasks}
            duePayments={payments}
          />
        </div>
        <WeatherBoard places={places} />
        <WeekCalendar events={weekEvents} />
        <ComingUpBoard />
        <PaymentBoard payments={payments} />
        <div className="dashboard-span">
          <TaskBoard tasks={openTasks} />
        </div>
      </div>
    </PageContainer>
  );
}
