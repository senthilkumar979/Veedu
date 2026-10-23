"use client";

export function WeatherChip({
  label,
  temp,
  place,
}: {
  label: string;
  temp: number;
  place: string;
}) {
  return (
    <span className="inline-flex max-w-[11rem] items-center gap-1.5 truncate rounded-pill border border-border bg-surface-subtle px-2.5 py-1 text-xs text-muted">
      <span className="font-semibold text-primary">{Math.round(temp)}°</span>
      <span className="truncate">
        <span className="text-ink">{label}</span>
        <span className="text-subtle"> · {place}</span>
      </span>
    </span>
  );
}
