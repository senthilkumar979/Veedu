"use client";

import { useQuery } from "@tanstack/react-query";
import type { WeatherSnapshot } from "@veedu/types";

export interface WeatherResultDto {
  snapshot: WeatherSnapshot | null;
  error?: string;
  source: "open-meteo" | "empty";
}

async function fetchWeather(
  home?: string | null,
  parents?: string | null,
): Promise<{ home: WeatherResultDto; parents: WeatherResultDto }> {
  const params = new URLSearchParams();
  if (home) params.set("home", home);
  if (parents) params.set("parents", parents);
  const res = await fetch(`/api/weather?${params.toString()}`);
  if (!res.ok) throw new Error("Weather request failed");
  return res.json() as Promise<{
    home: WeatherResultDto;
    parents: WeatherResultDto;
  }>;
}

export function useWeather(
  home?: string | null,
  parents?: string | null,
) {
  return useQuery({
    queryKey: ["weather", home ?? "", parents ?? ""],
    queryFn: () => fetchWeather(home, parents),
    staleTime: 30 * 60 * 1000,
    enabled: Boolean(home || parents),
  });
}
