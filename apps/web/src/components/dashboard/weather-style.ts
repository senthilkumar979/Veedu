import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
  type LucideIcon,
} from "lucide-react";
import type { WeatherHour } from "@veedu/types";

export function visibleHours(hours: WeatherHour[], observedAt?: string, limit?: number) {
  const key = observedAt?.slice(0, 13);
  const start = key ? hours.findIndex((hour) => hour.time.startsWith(key)) : 0;
  const slice = hours.slice(start < 0 ? 0 : start);
  return limit ? slice.slice(0, limit) : slice;
}

export function glyphFor(condition: string): LucideIcon {
  const name = condition.toLowerCase();
  if (name.includes("thunder")) return CloudLightning;
  if (name.includes("snow")) return CloudSnow;
  if (name.includes("rain") || name.includes("drizzle") || name.includes("shower")) return CloudRain;
  if (name.includes("fog")) return CloudFog;
  if (name.includes("cloud") || name.includes("overcast")) return Cloud;
  return Sun;
}
