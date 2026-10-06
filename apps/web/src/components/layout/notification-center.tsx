"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@veedu/ui";
import { useHouseholdData } from "@/lib/data";

interface NotificationCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationCenter({
  open,
  onOpenChange,
}: NotificationCenterProps) {
  const { notifications } = useHouseholdData();
  const items = notifications.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription>
            Event-driven household alerts. Quiet hours: 22:00–07:00.
          </DialogDescription>
        </DialogHeader>
        <ul className="max-h-[60vh] divide-y divide-border overflow-y-auto">
          {items.length === 0 ? (
            <li className="px-5 py-8 text-center text-sm text-muted">
              You&apos;re all caught up.
            </li>
          ) : (
            items.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href ?? "/"}
                  onClick={() => onOpenChange(false)}
                  className="block px-5 py-3 hover:bg-surface-hover"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-ink">{n.title}</p>
                    <Badge
                      tone={
                        n.priority === "critical" || n.priority === "high"
                          ? "danger"
                          : "neutral"
                      }
                    >
                      {n.priority}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">{n.body}</p>
                  <p className="mt-1 text-xs text-subtle">
                    {formatDistanceToNow(new Date(n.created_at), {
                      addSuffix: true,
                    })}
                    {!n.read_at ? " · unread" : ""}
                  </p>
                </Link>
              </li>
            ))
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
