"use client";

import type { ReactNode } from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@veedu/ui";
import type { WeatherHour, WeatherSnapshot } from "@veedu/types";
import { conditionTone, glyphFor, visibleHours } from "./weather-style";

export interface WeatherPlace {
  label: string;
  snapshot: WeatherSnapshot | null | undefined;
  error?: string;
  isLoading?: boolean;
}

export function WeatherPane({
  place,
  hourLimit,
  showMeta,
  action,
}: {
  place: WeatherPlace;
  hourLimit?: number;
  showMeta?: boolean;
  action?: ReactNode;
}) {
  const snapshot = place.snapshot;
  const tone = conditionTone(snapshot?.condition);

  return (
    <div className={cn("bg-gradient-to-b px-4 pb-3 pt-3 text-[#F6F3EB]", tone)}>
      {place.isLoading ? <p className="py-6 text-sm text-white/80">Loading forecast…</p> : null}
      {!place.isLoading && !snapshot ? (
        <p className="py-6 text-sm text-white/80">{place.error || "Set a location in Settings"}</p>
      ) : null}
      {snapshot ? (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="truncate text-[15px] font-semibold">
                  {snapshot.location_label || place.label}
                </p>
                {action}
              </div>
              <p className="truncate text-[13px] text-white/75">{snapshot.condition}</p>
              {snapshot.low_c != null && snapshot.high_c != null ? (
                <p className="mt-1 text-[13px] text-white/80">
                  H:{Math.round(snapshot.high_c)}° L:{Math.round(snapshot.low_c)}°
                </p>
              ) : null}
            </div>
            <p className="text-[2.75rem] font-light leading-none tracking-tight">
              {Math.round(snapshot.temperature_c)}°
            </p>
          </div>
          {showMeta ? (
            <p className="mt-2 text-xs text-white/75">
              Feels like {Math.round(snapshot.feels_like_c)}° · Humidity {snapshot.humidity}%
            </p>
          ) : null}
          <HourStrip
            hours={visibleHours(snapshot.hours ?? [], snapshot.observed_at, hourLimit)}
            observedAt={snapshot.observed_at}
            onDark
          />
        </>
      ) : null}
    </div>
  );
}

export function CityRow({ place, detailed }: { place: WeatherPlace; detailed: boolean }) {
  const snapshot = place.snapshot;
  return (
    <li className="px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">
            {snapshot?.location_label || place.label}
          </p>
          <p className="truncate text-xs text-muted">
            {place.isLoading ? "Loading…" : snapshot?.condition || place.error || "No location"}
          </p>
        </div>
        {snapshot ? (
          <p className="text-2xl font-light tabular-nums text-ink">
            {Math.round(snapshot.temperature_c)}°
          </p>
        ) : null}
      </div>
      {detailed && snapshot ? (
        <>
          <p className="mt-1 text-xs text-muted">
            Feels like {Math.round(snapshot.feels_like_c)}° · Humidity {snapshot.humidity}%
          </p>
          <HourStrip
            hours={visibleHours(snapshot.hours ?? [], snapshot.observed_at)}
            observedAt={snapshot.observed_at}
          />
        </>
      ) : null}
    </li>
  );
}

function HourStrip({
  hours,
  observedAt,
  onDark,
}: {
  hours: WeatherHour[];
  observedAt?: string;
  onDark?: boolean;
}) {
  if (hours.length === 0) return null;
  const nowKey = observedAt?.slice(0, 13);
  return (
    <ol
      className={cn(
        "mt-3 flex gap-3 overflow-x-auto border-t pt-2",
        onDark ? "border-white/15" : "border-border",
      )}
    >
      {hours.map((hour) => {
        const Icon = glyphFor(hour.condition);
        const isNow = Boolean(nowKey && hour.time.startsWith(nowKey));
        return (
          <li key={hour.time} className="flex w-10 shrink-0 flex-col items-center gap-1">
            <span className={cn("text-[11px]", isNow ? "font-semibold" : onDark ? "text-white/70" : "text-muted")}>
              {format(parseISO(hour.time), "HH")}
            </span>
            <Icon className={cn("h-4 w-4", onDark ? "text-white" : "text-primary")} />
            <span className={cn("text-[12px] font-medium", onDark ? "text-white" : "text-ink")}>
              {Math.round(hour.temperature_c)}°
            </span>
          </li>
        );
      })}
    </ol>
  );
}
