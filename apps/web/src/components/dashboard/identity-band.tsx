import { WeatherTile } from "./weather-tile";
import type { WeatherSnapshot } from "@veedu/types";

interface IdentityBandProps {
  greeting: string;
  householdName: string;
  dateLabel: string;
  snapshot: WeatherSnapshot | null | undefined;
  error?: string;
  isLoading?: boolean;
  className?: string;
}

export function IdentityBand({
  greeting,
  householdName,
  dateLabel,
  snapshot,
  error,
  isLoading,
  className,
}: IdentityBandProps) {
  return (
    <section
      className={`flex min-h-0 flex-col justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-card sm:flex-row sm:items-center ${className ?? ""}`}
    >
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">
          Velan Illam
        </p>
        <h1 className="truncate text-2xl font-semibold tracking-tight text-ink">
          {greeting}
        </h1>
        <p className="truncate text-sm text-muted">
          {householdName} · {dateLabel}
        </p>
      </div>
      <WeatherTile
        label="Home"
        snapshot={snapshot}
        error={error}
        isLoading={isLoading}
        className="sm:w-56"
      />
    </section>
  );
}
