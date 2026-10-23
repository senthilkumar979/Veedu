"use client";

import { Badge, Checkbox } from "@veedu/ui";
import { RowActions } from "@/components/shared/row-actions";
import type { Contact } from "@veedu/types";

interface ViewProps {
  contacts: Contact[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onEdit: (c: Contact) => void;
  onArchive: (id: string) => void;
}

export function ListView({
  contacts,
  selectedIds,
  onToggleSelect,
  onEdit,
  onArchive,
}: ViewProps) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      {contacts.map((c) => (
        <li
          key={c.id}
          className={`flex items-start gap-3 px-4 py-4 sm:gap-4 sm:px-5 ${
            selectedIds.has(c.id) ? "bg-primary-soft/40" : "hover:bg-surface-subtle/80"
          }`}
        >
          <Checkbox
            checked={selectedIds.has(c.id)}
            onCheckedChange={() => onToggleSelect(c.id)}
            aria-label={`Select ${c.name}`}
          />
          <Avatar name={c.name} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-base font-semibold text-ink">{c.name}</p>
              <Badge tone="neutral">{c.category}</Badge>
            </div>
            <p className="mt-1 text-sm text-ink">{c.phone || "No phone"}</p>
            <p className="text-sm text-muted">{c.email || "No email"}</p>
          </div>
          <RowActions
            onEdit={() => onEdit(c)}
            onArchive={() => onArchive(c.id)}
          />
        </li>
      ))}
    </ul>
  );
}

export function GridView({
  contacts,
  selectedIds,
  onToggleSelect,
  onEdit,
  onArchive,
}: ViewProps) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {contacts.map((c) => (
        <li
          key={c.id}
          className={`rounded-2xl border border-border bg-surface p-4 shadow-card ${
            selectedIds.has(c.id) ? "border-primary ring-2 ring-primary/20" : ""
          }`}
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <Checkbox
              checked={selectedIds.has(c.id)}
              onCheckedChange={() => onToggleSelect(c.id)}
              aria-label={`Select ${c.name}`}
            />
            <RowActions
              onEdit={() => onEdit(c)}
              onArchive={() => onArchive(c.id)}
            />
          </div>
          <Avatar name={c.name} large />
          <p className="mt-3 truncate font-semibold text-ink">{c.name}</p>
          <Badge tone="neutral" className="mt-1">
            {c.category}
          </Badge>
          <p className="mt-2 text-sm text-muted">{c.phone || c.email || "—"}</p>
        </li>
      ))}
    </ul>
  );
}

export function GroupedView(props: ViewProps) {
  const groups = new Map<string, Contact[]>();
  for (const c of props.contacts) {
    const key = c.category || "Other";
    const rows = groups.get(key) ?? [];
    rows.push(c);
    groups.set(key, rows);
  }

  return (
    <div className="space-y-4">
      {[...groups.entries()].map(([cat, rows]) => (
        <section key={cat} className="space-y-2">
          <div className="rounded-xl border border-border bg-surface px-4 py-2 shadow-card">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
              {cat} · {rows.length}
            </h2>
          </div>
          <ListView {...props} contacts={rows} />
        </section>
      ))}
    </div>
  );
}

function Avatar({ name, large }: { name: string; large?: boolean }) {
  const initials =
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary ${
        large ? "mx-auto h-14 w-14 text-base" : "h-11 w-11 text-sm"
      }`}
      aria-hidden
    >
      {initials}
    </span>
  );
}
