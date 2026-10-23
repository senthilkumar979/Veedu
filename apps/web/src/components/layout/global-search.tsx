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

interface SearchHit {
  type: string;
  title: string;
  href: string;
  subtitle?: string;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [q, setQ] = useState("");
  const data = useHouseholdData();

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [] as SearchHit[];
    const rows: SearchHit[] = [];

    const push = (
      type: string,
      title: string,
      href: string,
      subtitle?: string,
    ) => {
      const hay = `${title} ${subtitle ?? ""}`.toLowerCase();
      if (!hay.includes(query)) return;
      rows.push({ type, title, href, subtitle });
    };

    for (const t of data.tasks.data ?? []) {
      push("Task", t.title, "/tasks", t.status);
    }
    for (const e of data.events.data ?? []) {
      push("Event", e.title, "/calendar", e.location ?? undefined);
    }
    for (const d of data.documents.data ?? []) {
      push("Document", d.title, `/documents/${d.id}`, d.category ?? undefined);
    }
    for (const b of data.bills.data ?? []) {
      push("Bill", b.name, "/bills", b.provider ?? undefined);
    }
    for (const s of data.subscriptions.data ?? []) {
      push("Subscription", s.name, "/subscriptions", s.provider ?? undefined);
    }
    for (const c of data.contacts.data ?? []) {
      const hay = [c.name, c.email, c.phone].filter(Boolean).join(" ");
      if (hay.toLowerCase().includes(query)) {
        rows.push({
          type: "Contact",
          title: c.name,
          href: "/contacts",
          subtitle: c.email ?? c.phone ?? undefined,
        });
      }
    }
    for (const p of data.places.data ?? []) {
      push("Place", p.name, "/places", p.address ?? undefined);
    }
    for (const i of data.importantDates.data ?? []) {
      push("Important Date", i.title, "/important-dates", i.date);
    }
    for (const a of data.accounts.data ?? []) {
      push("Account", a.nickname, "/accounts", a.institution);
    }
    for (const h of data.homeItems.data ?? []) {
      push("Home item", h.name, "/home", h.category);
    }
    for (const h of data.homeServices.data ?? []) {
      push("Home service", h.name, "/home");
    }

    return rows.slice(0, 30);
  }, [q, data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>
            Live household data — tasks, calendar, bills, contacts, and more.
          </DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="Search your household…"
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
              <li key={`${r.type}-${r.href}-${r.title}-${r.subtitle ?? ""}`}>
                <Link
                  href={r.href}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-surface-hover"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-ink">
                      {r.title}
                    </span>
                    {r.subtitle ? (
                      <span className="block truncate text-xs text-subtle">
                        {r.subtitle}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-xs text-muted">{r.type}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
