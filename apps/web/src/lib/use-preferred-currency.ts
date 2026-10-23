"use client";

import { resolveCurrency, type CurrencyCode } from "@veedu/types";
import { useAuth } from "@/lib/auth";

/** Household preferred currency, falling back to EUR when unset/legacy. */
export function usePreferredCurrency(): CurrencyCode {
  const { household } = useAuth();
  return resolveCurrency(household?.currency);
}
