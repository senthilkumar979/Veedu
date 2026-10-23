"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bot,
  CalendarClock,
  CalendarDays,
  Contact,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  MapPin,
  Receipt,
  Settings,
  Star,
  Users,
  Wallet,
  CheckSquare,
  Radar,
  PenLine,
  Banknote,
} from "lucide-react";
import { cn } from "@veedu/ui";
import { PeacockFeather } from "@/components/brand/motifs";

const sections = [
  {
    title: "Day",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/calendar", label: "Calendar", icon: CalendarDays },
      { href: "/tasks", label: "Tasks", icon: CheckSquare },
      { href: "/due-dates", label: "Due dates", icon: CalendarClock },
    ],
  },
  {
    title: "Money",
    items: [
      { href: "/payments", label: "Payments", icon: Banknote },
      { href: "/bills", label: "Bills", icon: Receipt },
      { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
      { href: "/accounts", label: "Accounts", icon: Wallet },
    ],
  },
  {
    title: "People & home",
    items: [
      { href: "/family", label: "Family", icon: Users },
      { href: "/contacts", label: "Contacts", icon: Contact },
      { href: "/documents", label: "Documents", icon: FileText },
      { href: "/activity", label: "Activity", icon: Activity },
      { href: "/home", label: "Home", icon: Home },
      { href: "/places", label: "Places", icon: MapPin },
      { href: "/important-dates", label: "Dates", icon: Star },
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
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="sticky top-0 hidden h-full w-sidebar shrink-0 flex-col overflow-hidden border-r border-primary/20 bg-primary text-white md:flex"
      aria-label="Primary"
    >
      <div className="relative flex h-[4.25rem] shrink-0 items-center gap-3 overflow-hidden px-5">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/25 via-transparent to-transparent"
          aria-hidden
        />
        <PeacockFeather className="relative h-10 w-8 shrink-0 text-accent-soft" />
        <div className="relative min-w-0">
          <p className="truncate text-base font-semibold tracking-tight">
            Velan Illam
          </p>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-accent-soft/90">
            Household
          </p>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-1">
        {sections.map((section) => (
          <div key={section.title} className="mb-5">
            <p className="mb-1.5 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/45">
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
                        "group flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-all duration-fast",
                        active
                          ? "bg-white text-primary shadow-card"
                          : "text-white/85 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active ? "text-accent" : "text-white/70 group-hover:text-white",
                        )}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        <Link
          href="/settings"
          className={cn(
            "flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-colors",
            pathname.startsWith("/settings")
              ? "bg-white text-primary"
              : "text-white/85 hover:bg-white/10",
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
