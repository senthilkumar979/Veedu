"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CheckSquare,
  Contact,
  LayoutDashboard,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@veedu/ui";

const items = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/contacts", label: "Contacts", icon: Contact },
  { href: "/more", label: "More", icon: MoreHorizontal },
];

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-border/80 bg-surface/95 backdrop-blur-md md:hidden"
      aria-label="Mobile"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-1 py-1.5 text-[0.7rem] font-medium transition-colors",
                  active ? "text-primary" : "text-muted",
                )}
              >
                {active ? (
                  <span
                    className="absolute top-1 h-1 w-6 rounded-pill bg-accent"
                    aria-hidden
                  />
                ) : null}
                <Icon className={cn("h-5 w-5", active && "text-accent")} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
