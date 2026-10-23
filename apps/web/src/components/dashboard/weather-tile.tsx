import type { WeatherSnapshot } from "@veedu/types";

interface WeatherTileProps {
  label: string;
  snapshot: WeatherSnapshot | null | undefined;
  error?: string;
  isLoading?: boolean;
  className?: string;
}

export function WeatherTile({
  label,
  snapshot,
  error,
  isLoading,
  className,
}: WeatherTileProps) {
  return (
    <div className={`rounded-lg bg-surface-subtle px-3 py-2 ${className ?? ""}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
        {label}
      </p>
      {isLoading ? (
        <p className="mt-1 text-sm text-muted">Loading…</p>
      ) : snapshot ? (
        <>
          <p className="text-2xl font-semibold leading-tight text-ink">
            {snapshot.temperature_c}°
          </p>
          <p className="text-sm text-muted">{snapshot.condition}</p>
          <p className="text-xs text-subtle">
            Feels like {snapshot.feels_like_c}° · {snapshot.location_label}
          </p>
        </>
      ) : (
        <p className="mt-1 text-sm text-muted">
          {error || "Set a location in onboarding/settings"}
        </p>
      )}
    </div>
  );
}
