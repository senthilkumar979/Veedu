"use client";

import { useMemo } from "react";
import { addDays, format, parseISO } from "date-fns";
import {
  buildAttentionItems,
  greetingForHour,
  taskProgress,
} from "@veedu/domain";
import { PageContainer } from "@/components/layout/page-container";
import { ErrorState, LoadingBlock } from "@/components/shared/states";
import { CalendarAgenda } from "@/components/dashboard/calendar-agenda";
import { WeatherHero } from "@/components/dashboard/weather-hero";
import {
  AttentionPanel,
  DocumentsPanel,
  PaymentsPanel,
} from "@/components/dashboard/household-panels";
import { TasksPanel } from "@/components/dashboard/panels";
import { useGoogleSyncOnLoad } from "@/hooks/use-google-sync-on-load";
import { useWeather } from "@/hooks/use-weather";
import { useAuth } from "@/lib/auth";
import { useHouseholdData } from "@/lib/data";
import { resolveParentLocations } from "@/lib/household/parent-locations";

export default function DashboardPage() {
  const { profile, household } = useAuth();
  const { tasks, events, bills, subscriptions, documents, importantDates } =
    useHouseholdData();
  const parentPlaces = resolveParentLocations(household);
  const weatherQuery = useWeather(household?.home_location, parentPlaces);
  const googleSync = useGoogleSyncOnLoad();

  const loading =
    tasks.isLoading || events.isLoading || bills.isLoading || documents.isLoading;
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
      }).slice(0, 4),
    [documents.data, bills.data, tasks.data, subscriptions.data, importantDates.data],
  );

  const upcomingEvents = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = addDays(start, 14);
    return (events.data ?? [])
      .filter((event) => {
        const at = parseISO(event.start_at);
        return at >= start && at < end;
      })
      .sort((a, b) => a.start_at.localeCompare(b.start_at))
      .slice(0, 12);
  }, [events.data]);

  const progress = taskProgress(tasks.data ?? []);
  const openTasks = (tasks.data ?? [])
    .filter((task) => task.status !== "done" && task.status !== "cancelled")
    .slice(0, 5);
  const upcomingPayments = [
    ...(bills.data ?? []),
    ...(subscriptions.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      currency: item.currency,
      due_date: item.next_renewal,
    })),
  ]
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 4);

  const homeError = weatherQuery.isError
    ? "Weather unavailable"
    : weatherQuery.data?.home.error;
  const parentWeather = (weatherQuery.data?.parents ?? []).map((row) =>
    weatherQuery.isError
      ? { ...row, error: "Weather unavailable" }
      : row,
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
    <PageContainer className="min-h-0 flex-1 lg:overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:overflow-hidden">
        <WeatherHero
          greeting={greetingForHour(
            new Date().getHours(),
            profile?.full_name ?? "there",
          )}
          householdName={household?.name ?? "Household"}
          dateLabel={format(new Date(), "EEEE, d MMMM yyyy")}
          home={weatherQuery.data?.home.snapshot}
          homeError={homeError}
          parents={parentWeather}
          isLoading={weatherQuery.isLoading}
        />

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-12 lg:overflow-hidden">
          <CalendarAgenda
            className="lg:col-span-7 lg:min-h-0"
            events={upcomingEvents}
            isSyncing={googleSync.isSyncing}
            calendarsSynced={googleSync.calendarsSynced}
          />
          <div className="flex min-h-0 flex-col gap-3 lg:col-span-5 lg:overflow-y-auto">
            <TasksPanel tasks={openTasks} progress={progress} />
            <PaymentsPanel payments={upcomingPayments} />
            <DocumentsPanel documents={(documents.data ?? []).slice(0, 3)} />
            <AttentionPanel items={attention} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
