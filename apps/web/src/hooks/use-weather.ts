"use client";

import { useQuery } from "@tanstack/react-query";
import type { ParentLocation, WeatherSnapshot } from "@veedu/types";

export interface WeatherResultDto {
  snapshot: WeatherSnapshot | null;
  error?: string;
  source: "open-meteo" | "empty";
  label?: string;
}

function encodeParents(parents: ParentLocation[]): string {
  return parents
    .map((p) => `${encodeURIComponent(p.label)}:${encodeURIComponent(p.place)}`)
    .join(",");
}

async function fetchWeather(
  home?: string | null,
  parents: ParentLocation[] = [],
): Promise<{ home: WeatherResultDto; parents: WeatherResultDto[] }> {
  const params = new URLSearchParams();
  if (home) params.set("home", home);
  if (parents.length) params.set("parents", encodeParents(parents));
  const res = await fetch(`/api/weather?${params.toString()}`);
  if (!res.ok) throw new Error("Weather request failed");
  return res.json() as Promise<{
    home: WeatherResultDto;
    parents: WeatherResultDto[];
  }>;
}

export function useWeather(
  home?: string | null,
  parents: ParentLocation[] = [],
) {
  const key = parents.map((p) => `${p.label}:${p.place}`).join("|");
  return useQuery({
    queryKey: ["weather", "today-hours", home ?? "", key],
    queryFn: () => fetchWeather(home, parents),
    staleTime: 30 * 60 * 1000,
    enabled: Boolean(home || parents.length),
  });
}
