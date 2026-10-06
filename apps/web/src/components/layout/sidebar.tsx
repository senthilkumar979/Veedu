"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  CalendarDays,
  Contact,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  MapPin,
  Receipt,
  Settings,
  Sparkles,
  Star,
  Wallet,
  CheckSquare,
  Radar,
  PenLine,
} from "lucide-react";
import { cn } from "@veedu/ui";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    title: "Household",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/calendar", label: "Calendar", icon: CalendarDays },
      { href: "/tasks", label: "Tasks", icon: CheckSquare },
      { href: "/bills", label: "Bills", icon: Receipt },
      { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
      { href: "/documents", label: "Documents", icon: FileText },
      { href: "/accounts", label: "Accounts", icon: Wallet },
    ],
  },
  {
    title: "People",
    items: [{ href: "/contacts", label: "Contacts", icon: Contact }],
  },
  {
    title: "Home",
    items: [
      { href: "/home", label: "Home", icon: Home },
      { href: "/places", label: "Places", icon: MapPin },
      { href: "/important-dates", label: "Important Dates", icon: Star },
    ],
  },
  {
    title: "AI",
    items: [
      { href: "/ai/assistant", label: "Assistant", icon: Bot },
      { href: "/ai/tech-radar", label: "Tech Radar", icon: Radar },
      { href: "/ai/content", label: "Content", icon: PenLine },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden h-dvh w-sidebar shrink-0 flex-col border-r border-border bg-surface md:flex"
      aria-label="Primary"
    >
      <div className="flex h-16 items-center gap-2 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
          V
        </div>
        <div>
          <p className="text-base font-semibold text-ink">Veedu</p>
          <p className="text-xs text-muted">Household OS</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {sections.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-subtle">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors duration-fast",
                        active
                          ? "bg-primary-soft text-primary"
                          : "text-muted hover:bg-surface-hover hover:text-ink",
                      )}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted hover:bg-surface-hover hover:text-ink",
            pathname.startsWith("/settings") && "bg-primary-soft text-primary",
          )}
        >
          <Settings className="h-[18px] w-[18px]" />
          Settings
        </Link>
        <p className="mt-2 flex items-center gap-1 px-2 text-xs text-subtle">
          <Sparkles className="h-3 w-3" /> Calm command center
        </p>
      </div>
    </aside>
  );
}
