"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@veedu/ui";
import {
  Bot,
  CalendarDays,
  CheckSquare,
  CreditCard,
  FileUp,
  Receipt,
  Star,
  Contact,
  MapPin,
  Wallet,
} from "lucide-react";

const commands = [
  { label: "Add task", href: "/tasks?new=1", icon: CheckSquare },
  { label: "Add bill", href: "/bills?new=1", icon: Receipt },
  { label: "Add subscription", href: "/subscriptions?new=1", icon: CreditCard },
  { label: "Upload document", href: "/documents?new=1", icon: FileUp },
  { label: "Add important date", href: "/important-dates?new=1", icon: Star },
  { label: "Add place", href: "/places?new=1", icon: MapPin },
  { label: "Add contact", href: "/contacts?new=1", icon: Contact },
  { label: "Add account", href: "/accounts?new=1", icon: Wallet },
  { label: "Open calendar", href: "/calendar", icon: CalendarDays },
  { label: "Ask household assistant", href: "/ai/assistant", icon: Bot },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle className="text-base">Quick Add</DialogTitle>
          <DialogDescription>
            Search or type a command… (⌘/Ctrl+K)
          </DialogDescription>
        </DialogHeader>
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {commands.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <li key={cmd.href}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-surface-hover"
                  onClick={() => {
                    onOpenChange(false);
                    router.push(cmd.href);
                  }}
                >
                  <Icon className="h-4 w-4 text-muted" />
                  <span className="text-ink">{cmd.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
