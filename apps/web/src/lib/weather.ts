import type { ParentLocation, WeatherSnapshot } from "@veedu/types";

const WMO_CONDITIONS: Record<number, string> = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with hail",
};

export interface WeatherResult {
  snapshot: WeatherSnapshot | null;
  error?: string;
  source: "open-meteo" | "empty";
  label?: string;
}

export async function geocodePlace(place: string) {
  const name = place.trim();
  if (!name) return null;
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", name);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    results?: Array<{
      name: string;
      latitude: number;
      longitude: number;
      admin1?: string;
      country?: string;
    }>;
  };
  const hit = data.results?.[0];
  if (!hit) return null;
  const parts = [hit.name, hit.admin1, hit.country].filter(Boolean);
  return {
    latitude: hit.latitude,
    longitude: hit.longitude,
    label: parts.join(", ") || name,
  };
}

export async function fetchForecast(
  latitude: number,
  longitude: number,
  locationLabel: string,
): Promise<WeatherSnapshot> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code",
  );
  url.searchParams.set("timezone", "auto");
  const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`Open-Meteo forecast failed (${res.status})`);
  const data = (await res.json()) as {
    current?: {
      temperature_2m?: number;
      relative_humidity_2m?: number;
      apparent_temperature?: number;
      weather_code?: number;
    };
  };
  const current = data.current;
  if (!current || current.temperature_2m == null) {
    throw new Error("Open-Meteo returned no current weather");
  }
  const code = current.weather_code ?? 0;
  return {
    location_label: locationLabel,
    temperature_c: Math.round(current.temperature_2m),
    feels_like_c: Math.round(
      current.apparent_temperature ?? current.temperature_2m,
    ),
    humidity: Math.round(current.relative_humidity_2m ?? 0),
    condition: WMO_CONDITIONS[code] ?? `Code ${code}`,
  };
}

export async function weatherForPlace(
  place: string | null | undefined,
  label?: string,
): Promise<WeatherResult> {
  if (!place?.trim()) {
    return { snapshot: null, error: "No location set", source: "empty", label };
  }
  try {
    const geo = await geocodePlace(place);
    if (!geo) {
      return {
        snapshot: null,
        error: `Could not geocode “${place.trim()}”`,
        source: "empty",
        label,
      };
    }
    const snapshot = await fetchForecast(geo.latitude, geo.longitude, geo.label);
    return { snapshot, source: "open-meteo", label };
  } catch (err) {
    return {
      snapshot: null,
      error: err instanceof Error ? err.message : "Weather unavailable",
      source: "empty",
      label,
    };
  }
}

export async function weatherForLocations(input: {
  home?: string | null;
  parents?: ParentLocation[];
}): Promise<{ home: WeatherResult; parents: WeatherResult[] }> {
  const parentRows = (input.parents ?? []).slice(0, 2);
  const [home, ...parents] = await Promise.all([
    weatherForPlace(input.home, "Home"),
    ...parentRows.map((p) => weatherForPlace(p.place, p.label)),
  ]);
  return { home, parents };
}
