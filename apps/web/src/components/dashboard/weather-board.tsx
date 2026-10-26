"use client";

import { format, parseISO } from "date-fns";
import type { WeatherSnapshot } from "@veedu/types";
import { ExpandableSection } from "./expandable-section";

export interface WeatherPlace {
  label: string;
  snapshot: WeatherSnapshot | null | undefined;
  error?: string;
  isLoading?: boolean;
}

export function WeatherBoard({ places }: { places: WeatherPlace[] }) {
  return (
    <ExpandableSection
      eyebrow="Today"
      title="Weather"
      summary={<WeatherSummary places={places} />}
    >
      <div className="space-y-5">
        {places.map((place) => (
          <LocationReport key={place.label} place={place} />
        ))}
      </div>
    </ExpandableSection>
  );
}

function WeatherSummary({ places }: { places: WeatherPlace[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {places.map((place) => (
        <li key={place.label} className="rounded-lg bg-surface-subtle px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
            {place.label}
          </p>
          <PlaceNow place={place} />
        </li>
      ))}
    </ul>
  );
}

function PlaceNow({ place }: { place: WeatherPlace }) {
  if (place.isLoading) return <p className="mt-1 text-sm text-muted">Loading…</p>;
  if (!place.snapshot) {
    return (
      <p className="mt-1 text-sm text-muted">
        {place.error || "Set a location in Settings"}
      </p>
    );
  }
  const { snapshot } = place;
  return (
    <>
      <p className="mt-1 text-2xl font-semibold leading-none text-ink">
        {snapshot.temperature_c}°
      </p>
      <p className="mt-1 text-sm text-muted">{snapshot.condition}</p>
      <p className="text-xs text-subtle">
        {snapshot.location_label}
        {snapshot.low_c != null && snapshot.high_c != null
          ? ` · ${snapshot.low_c}°–${snapshot.high_c}°`
          : ""}
      </p>
    </>
  );
}

function LocationReport({ place }: { place: WeatherPlace }) {
  const hours = place.snapshot?.hours ?? [];
  const nowKey = place.snapshot?.observed_at?.slice(0, 13);
  return (
    <div>
      <PlaceNow place={place} />
      {place.snapshot ? (
        <p className="mt-1 text-xs text-muted">
          Feels like {place.snapshot.feels_like_c}° · Humidity {place.snapshot.humidity}%
        </p>
      ) : null}
      {hours.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Hourly forecast is unavailable.</p>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {hours.map((hour) => {
            const isNow = Boolean(nowKey && hour.time.startsWith(nowKey));
            return (
              <li
                key={hour.time}
                className={`rounded-lg border px-2 py-2 ${
                  isNow ? "border-primary bg-primary-soft" : "border-border"
                }`}
              >
                <p className="text-xs font-medium text-muted">
                  {format(parseISO(hour.time), "HH:mm")}
                </p>
                <p className="text-base font-semibold text-ink">{hour.temperature_c}°</p>
                <p className="text-xs text-muted">{hour.condition}</p>
                <p className="text-xs text-subtle">
                  Feels {hour.feels_like_c}°
                  {hour.precipitation_chance != null
                    ? ` · ${hour.precipitation_chance}% rain`
                    : ""}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
