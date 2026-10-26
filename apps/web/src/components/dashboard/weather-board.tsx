"use client";

import { format, parseISO } from "date-fns";
import { cn } from "@veedu/ui";
import type { WeatherHour, WeatherSnapshot } from "@veedu/types";
import { DashboardCard } from "./dashboard-card";
import { glyphFor, visibleHours } from "./weather-style";

export interface WeatherPlace {
  label: string;
  snapshot: WeatherSnapshot | null | undefined;
  error?: string;
  isLoading?: boolean;
}

export function WeatherBoard({ places }: { places: WeatherPlace[] }) {
  const [primary, ...rest] = places;
  const snapshot = primary?.snapshot;
  const hours = visibleHours(snapshot?.hours ?? [], snapshot?.observed_at, 6);

  return (
    <DashboardCard title="Weather" meta={snapshot?.location_label || primary?.label}>
      {primary?.isLoading ? <p className="py-3 text-sm text-muted">Loading forecast…</p> : null}
      {!primary?.isLoading && !snapshot ? (
        <p className="py-3 text-sm text-muted">{primary?.error || "Set a location in Settings"}</p>
      ) : null}
      {snapshot ? (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm text-muted">{snapshot.condition}</p>
              {snapshot.low_c != null && snapshot.high_c != null ? (
                <p className="mt-1 text-xs text-muted">
                  H:{Math.round(snapshot.high_c)}° L:{Math.round(snapshot.low_c)}°
                </p>
              ) : null}
            </div>
            <p className="text-3xl font-semibold tabular-nums leading-none text-ink">
              {Math.round(snapshot.temperature_c)}°
            </p>
          </div>
          <HourStrip hours={hours} observedAt={snapshot.observed_at} />
        </>
      ) : null}
      {rest.length > 0 ? (
        <ul className="mt-2 border-t border-border">
          {rest.map((place) => (
            <CityLine key={place.label} place={place} />
          ))}
        </ul>
      ) : null}
    </DashboardCard>
  );
}

function CityLine({ place }: { place: WeatherPlace }) {
  const snapshot = place.snapshot;
  return (
    <li className="flex items-center justify-between gap-3 py-1.5">
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-ink">
          {snapshot?.location_label || place.label}
        </span>
        <span className="block truncate text-xs text-muted">
          {place.isLoading ? "Loading…" : snapshot?.condition || place.error || "No location"}
        </span>
      </span>
      {snapshot ? (
        <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
          {Math.round(snapshot.temperature_c)}°
        </span>
      ) : null}
    </li>
  );
}

function HourStrip({ hours, observedAt }: { hours: WeatherHour[]; observedAt?: string }) {
  if (hours.length === 0) return null;
  const nowKey = observedAt?.slice(0, 13);
  return (
    <ol className="mt-3 flex gap-2 overflow-x-auto">
      {hours.map((hour) => {
        const Icon = glyphFor(hour.condition);
        const isNow = Boolean(nowKey && hour.time.startsWith(nowKey));
        return (
          <li key={hour.time} className="flex w-9 shrink-0 flex-col items-center gap-0.5">
            <span className={cn("text-[11px]", isNow ? "font-semibold text-ink" : "text-muted")}>
              {format(parseISO(hour.time), "HH")}
            </span>
            <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span className="text-[11px] font-medium text-ink">{Math.round(hour.temperature_c)}°</span>
          </li>
        );
      })}
    </ol>
  );
}
