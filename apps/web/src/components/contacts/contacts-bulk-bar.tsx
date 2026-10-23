"use client";

import { Button, Select } from "@veedu/ui";
import { CONTACT_CATEGORIES } from "@veedu/types";

interface ContactsBulkBarProps {
  selectedCount: number;
  bulkCategory: string;
  onBulkCategoryChange: (value: string) => void;
  onApply: () => void;
  onCancel: () => void;
}

export function ContactsBulkBar({
  selectedCount,
  bulkCategory,
  onBulkCategoryChange,
  onApply,
  onCancel,
}: ContactsBulkBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-xl border border-primary/20 bg-primary-soft/50 px-3 py-2">
      <p className="pb-2 text-sm font-medium text-primary">
        {selectedCount} selected
      </p>
      <Select
        label="Set category"
        value={bulkCategory}
        onValueChange={onBulkCategoryChange}
        options={CONTACT_CATEGORIES.map((c) => ({ value: c, label: c }))}
      />
      <Button size="sm" className="h-11" onClick={onApply}>
        Apply
      </Button>
      <Button size="sm" variant="ghost" className="h-11" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
