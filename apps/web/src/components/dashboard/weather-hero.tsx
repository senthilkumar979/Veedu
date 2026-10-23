"use client";

import type { WeatherSnapshot } from "@veedu/types";
import type { WeatherResultDto } from "@/hooks/use-weather";

interface WeatherHeroProps {
  greeting: string;
  householdName: string;
  dateLabel: string;
  home: WeatherSnapshot | null | undefined;
  homeError?: string;
  parents: WeatherResultDto[];
  isLoading?: boolean;
}

function conditionTone(condition: string | undefined): string {
  const c = (condition || "").toLowerCase();
  if (c.includes("clear") || c.includes("sun")) {
    return "from-[#3d6b52] via-[#4a7d5f] to-[#b69a60]";
  }
  if (c.includes("rain") || c.includes("drizzle") || c.includes("thunder")) {
    return "from-[#2f4a42] via-[#3f5f56] to-[#355747]";
  }
  if (c.includes("cloud") || c.includes("overcast") || c.includes("fog")) {
    return "from-[#3a4540] via-[#4a5550] to-[#5a6a60]";
  }
  return "from-[#355747] via-[#3e6b54] to-[#5a7a4a]";
}

export function WeatherHero({
  greeting,
  householdName,
  dateLabel,
  home,
  homeError,
  parents,
  isLoading,
}: WeatherHeroProps) {
  const parentTiles =
    parents.length > 0
      ? parents
      : [{ snapshot: null, error: "Set parents in Settings", source: "empty" as const, label: "Parents" }];

  return (
    <section
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${conditionTone(home?.condition)} px-5 py-6 text-white shadow-card sm:px-8 sm:py-8 animate-dash-in`}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl"
        aria-hidden
      />
      <div className="relative grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/75">
            Velan Illam
          </p>
          <h1 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
            {greeting}
          </h1>
          <p className="mt-2 text-sm text-white/80">
            {householdName} · {dateLabel}
          </p>
        </div>
        <div
          className={`grid gap-3 ${
            parentTiles.length > 1 ? "sm:grid-cols-3" : "sm:grid-cols-2"
          }`}
        >
          <WeatherStat
            label="Home"
            snapshot={home}
            error={homeError}
            isLoading={isLoading}
            primary
          />
          {parentTiles.map((tile, i) => (
            <WeatherStat
              key={`${tile.label ?? "parent"}-${i}`}
              label={tile.label || `Parent ${i + 1}`}
              snapshot={tile.snapshot}
              error={tile.error}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function WeatherStat({
  label,
  snapshot,
  error,
  isLoading,
  primary,
}: {
  label: string;
  snapshot: WeatherSnapshot | null | undefined;
  error?: string;
  isLoading?: boolean;
  primary?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/70">
        {label}
      </p>
      {isLoading ? (
        <p className="mt-2 text-sm text-white/70">Loading…</p>
      ) : snapshot ? (
        <>
          <p
            className={`mt-1 font-semibold leading-none tracking-tight ${
              primary ? "text-4xl sm:text-5xl" : "text-3xl"
            }`}
          >
            {Math.round(snapshot.temperature_c)}°
          </p>
          <p className="mt-2 text-sm text-white/90">{snapshot.condition}</p>
          <p className="mt-0.5 text-xs text-white/65">
            Feels {Math.round(snapshot.feels_like_c)}° · {snapshot.location_label}
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-white/70">
          {error || "Set location in Settings"}
        </p>
      )}
    </div>
  );
}
