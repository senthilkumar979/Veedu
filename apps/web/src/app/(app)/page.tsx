"use client";

import { useMemo } from "react";
import { endOfWeek, format, parseISO, startOfWeek } from "date-fns";
import { greetingForHour, taskProgress } from "@veedu/domain";
import { PageContainer } from "@/components/layout/page-container";
import { ErrorState, LoadingBlock } from "@/components/shared/states";
import { PaymentBoard } from "@/components/dashboard/payment-board";
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
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(start, { weekStartsOn: 1 });
    return (events.data ?? [])
      .filter((event) => {
        const at = parseISO(event.start_at);
        return at >= start && at <= end;
      })
      .sort((a, b) => a.start_at.localeCompare(b.start_at));
  }, [events.data]);

  const progress = taskProgress(tasks.data ?? []);
  const openTasks = (tasks.data ?? [])
    .filter((task) => task.status !== "done" && task.status !== "cancelled")
    .sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"));

  const payments = [
    ...(bills.data ?? []).map((bill) => ({
      id: bill.id,
      name: bill.name,
      amount: bill.amount,
      currency: bill.currency,
      due_date: bill.due_date,
      status: bill.status,
      frequency: bill.frequency,
      provider: bill.provider,
    })),
    ...(subscriptions.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      currency: item.currency,
      due_date: item.next_renewal,
      frequency: item.billing_frequency,
      provider: item.provider,
    })),
  ].sort((a, b) => a.due_date.localeCompare(b.due_date));

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
      <PageContainer title="Dashboard" description="Loading your household…">
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
    <PageContainer
      title={greetingForHour(new Date().getHours(), profile?.full_name ?? "there")}
      description={`${household?.name ?? "Household"} · ${format(new Date(), "EEEE, d MMMM yyyy")}`}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <WeatherBoard places={places} />
        <WeekCalendar events={weekEvents} />
        <TaskBoard tasks={openTasks} progress={progress} />
        <PaymentBoard payments={payments} />
      </div>
    </PageContainer>
  );
}
