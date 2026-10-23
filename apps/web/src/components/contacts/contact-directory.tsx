"use client";

import { Button } from "@veedu/ui";
import { EmptyState } from "@/components/shared/states";
import {
  GridView,
  GroupedView,
  ListView,
} from "@/components/contacts/contact-views";
import type { Contact } from "@veedu/types";

export type ContactsView = "list" | "grid" | "grouped";

interface ContactDirectoryProps {
  contacts: Contact[];
  view: ContactsView;
  category: string;
  selectedIds: Set<string>;
  onCategoryChange: (value: string) => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearSelection: () => void;
  categories: readonly string[];
  onEdit: (contact: Contact) => void;
  onArchive: (id: string) => void;
  onCreate: () => void;
}

export function ContactDirectory({
  contacts,
  view,
  category,
  selectedIds,
  onCategoryChange,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  categories,
  onEdit,
  onArchive,
  onCreate,
}: ContactDirectoryProps) {
  if (contacts.length === 0) {
    return (
      <EmptyState
        title="No contacts"
        actionLabel="Add contact"
        onAction={onCreate}
      />
    );
  }

  const allSelected =
    contacts.length > 0 && contacts.every((c) => selectedIds.has(c.id));
  const viewProps = {
    contacts,
    selectedIds,
    onToggleSelect,
    onEdit,
    onArchive,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 shadow-card">
        <FilterChip
          active={category === "All"}
          label="All"
          onClick={() => onCategoryChange("All")}
        />
        {categories.map((c) => (
          <FilterChip
            key={c}
            active={category === c}
            label={c}
            onClick={() => onCategoryChange(c)}
          />
        ))}
        <span className="mx-1 hidden h-5 w-px bg-border sm:inline" />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-9"
          onClick={() =>
            allSelected
              ? onClearSelection()
              : onSelectAll(contacts.map((c) => c.id))
          }
        >
          {allSelected ? "Clear selection" : "Select all"}
        </Button>
      </div>

      {view === "grouped" ? (
        <GroupedView {...viewProps} />
      ) : view === "grid" ? (
        <GridView {...viewProps} />
      ) : (
        <ListView {...viewProps} />
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "primary" : "secondary"}
      className="h-9 rounded-pill"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
