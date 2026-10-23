"use client";

import { useMemo, useState } from "react";
import { addDays, addMonths, addWeeks, isSameDay, startOfDay } from "date-fns";
import { PageContainer } from "@/components/layout/page-container";
import { ErrorState, LoadingBlock } from "@/components/shared/states";
import { AgendaPanel } from "@/components/calendar/agenda-panel";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import {
  countInRange,
  type CalendarView,
} from "@/components/calendar/calendar-utils";
import { MiniMonth } from "@/components/calendar/mini-month";
import { MonthBoard } from "@/components/calendar/month-board";
import { UpcomingRail } from "@/components/calendar/upcoming-rail";
import { WeekBoard } from "@/components/calendar/week-board";
import { useGoogleSyncOnLoad } from "@/hooks/use-google-sync-on-load";
import { useHouseholdData } from "@/lib/data";

export default function CalendarPage() {
  const { events } = useHouseholdData();
  const googleSync = useGoogleSyncOnLoad();
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [view, setView] = useState<CalendarView>("agenda");

  const sorted = useMemo(
    () =>
      [...(events.data ?? [])].sort((a, b) =>
        a.start_at.localeCompare(b.start_at),
      ),
    [events.data],
  );

  const today = startOfDay(new Date());
  const todayCount = sorted.filter((e) =>
    isSameDay(new Date(e.start_at), today),
  ).length;
  const weekCount = countInRange(sorted, today, addDays(today, 7));

  if (events.isLoading)
    return (
      <PageContainer title="Calendar">
        <LoadingBlock rows={5} />
      </PageContainer>
    );
  if (events.isError)
    return (
      <PageContainer title="Calendar">
        <ErrorState onRetry={() => void events.refetch()} />
      </PageContainer>
    );

  const syncHint = googleSync.isSyncing
    ? "Syncing Family & Primary calendars…"
    : googleSync.calendarsSynced.length
      ? `Synced · ${googleSync.calendarsSynced.join(" · ")}`
      : "Connect Google in Settings to sync Family calendar";

  function step(direction: -1 | 1) {
    if (view === "month") setCursor(addMonths(cursor, direction));
    else if (view === "week") setCursor(addWeeks(cursor, direction));
    else setCursor(addDays(cursor, direction));
  }

  function selectDay(day: Date) {
    setCursor(startOfDay(day));
  }

  return (
    <PageContainer className="gap-4">
      <CalendarHeader
        cursor={cursor}
        view={view}
        onViewChange={setView}
        onStep={step}
        onToday={() => setCursor(today)}
        todayCount={todayCount}
        weekCount={weekCount}
        syncHint={syncHint}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,17rem)_1fr]">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          <MiniMonth
            cursor={cursor}
            events={sorted}
            onSelectDay={selectDay}
          />
          <UpcomingRail
            events={sorted}
            cursor={cursor}
            onSelectDay={(day) => {
              selectDay(day);
              setView("agenda");
            }}
          />
        </aside>

        <div className="min-w-0">
          {view === "agenda" ? (
            <AgendaPanel
              cursor={cursor}
              events={sorted}
              onSelectDay={selectDay}
            />
          ) : null}
          {view === "week" ? (
            <WeekBoard
              cursor={cursor}
              events={sorted}
              onSelectDay={(day) => {
                selectDay(day);
                setView("agenda");
              }}
            />
          ) : null}
          {view === "month" ? (
            <MonthBoard
              cursor={cursor}
              events={sorted}
              onSelectDay={(day) => {
                selectDay(day);
                setView("agenda");
              }}
            />
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}
