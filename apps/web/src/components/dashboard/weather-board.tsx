"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@veedu/ui";
import { CityRow, WeatherPane, type WeatherPlace } from "./weather-pane";

export type { WeatherPlace };

export function WeatherBoard({ places }: { places: WeatherPlace[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [primary, ...rest] = places;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      {primary ? (
        <WeatherPane
          place={primary}
          hourLimit={isOpen ? undefined : 8}
          showMeta={isOpen}
          action={
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10"
              aria-expanded={isOpen}
              aria-label={isOpen ? "Hide forecast" : "Show forecast"}
              onClick={() => setIsOpen((open) => !open)}
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
            </button>
          }
        />
      ) : (
        <p className="px-4 py-6 text-sm text-muted">Set a location in Settings</p>
      )}
      {rest.length > 0 ? (
        <ul className="divide-y divide-border">
          {rest.map((place) => (
            <CityRow key={place.label} place={place} detailed={isOpen} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
