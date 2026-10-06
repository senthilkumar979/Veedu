"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
} from "@veedu/ui";
import { useHouseholdData } from "@/lib/data";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [q, setQ] = useState("");
  const data = useHouseholdData();

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const rows: { type: string; title: string; href: string }[] = [];
    for (const t of data.tasks.data ?? []) {
      if (t.title.toLowerCase().includes(query))
        rows.push({ type: "Task", title: t.title, href: "/tasks" });
    }
    for (const d of data.documents.data ?? []) {
      if (d.title.toLowerCase().includes(query))
        rows.push({
          type: "Document",
          title: d.title,
          href: `/documents/${d.id}`,
        });
    }
    for (const b of data.bills.data ?? []) {
      if (b.name.toLowerCase().includes(query))
        rows.push({ type: "Bill", title: b.name, href: "/bills" });
    }
    for (const s of data.subscriptions.data ?? []) {
      if (s.name.toLowerCase().includes(query))
        rows.push({ type: "Subscription", title: s.name, href: "/subscriptions" });
    }
    for (const c of data.contacts.data ?? []) {
      if (c.name.toLowerCase().includes(query))
        rows.push({ type: "Contact", title: c.name, href: "/contacts" });
    }
    for (const p of data.places.data ?? []) {
      if (p.name.toLowerCase().includes(query))
        rows.push({ type: "Place", title: p.name, href: "/places" });
    }
    for (const i of data.importantDates.data ?? []) {
      if (i.title.toLowerCase().includes(query))
        rows.push({
          type: "Important Date",
          title: i.title,
          href: "/important-dates",
        });
    }
    return rows.slice(0, 20);
  }, [q, data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>
            Tasks, bills, documents, contacts, places, and more.
          </DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="Search Veedu…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Global search"
        />
        <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto">
          {q && results.length === 0 ? (
            <li className="py-6 text-center text-sm text-muted">
              No matches for “{q}”.
            </li>
          ) : (
            results.map((r) => (
              <li key={`${r.type}-${r.href}-${r.title}`}>
                <Link
                  href={r.href}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-surface-hover"
                >
                  <span className="text-sm text-ink">{r.title}</span>
                  <span className="text-xs text-muted">{r.type}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
