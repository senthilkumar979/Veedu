"use client";

import { Select } from "@veedu/ui";
import { CURRENCY_OPTIONS, type CurrencyCode } from "@veedu/types";

interface CurrencySelectProps {
  value: string;
  onValueChange: (value: CurrencyCode) => void;
  label?: string;
}

export function CurrencySelect({
  value,
  onValueChange,
  label = "Currency",
}: CurrencySelectProps) {
  return (
    <Select
      label={label}
      value={value}
      onValueChange={(v) => onValueChange(v as CurrencyCode)}
      options={CURRENCY_OPTIONS.map((o) => ({
        value: o.value,
        label: o.label,
      }))}
    />
  );
}
