"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft, PanelLeftClose, Settings, type LucideIcon } from "lucide-react";
import { cn } from "@veedu/ui";
import { PeacockFeather } from "@/components/brand/motifs";
import { sidebarSections } from "./sidebar-nav";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-full shrink-0 flex-col overflow-hidden border-r border-primary/20 bg-primary text-white transition-[width] duration-normal md:flex",
        collapsed ? "w-sidebar-collapsed" : "w-sidebar",
      )}
      aria-label="Primary"
    >
      <SidebarHeader collapsed={collapsed} onToggle={onToggle} />
      <nav className={cn("min-h-0 flex-1 overflow-y-auto pb-4 pt-1", collapsed ? "px-2" : "px-3")}>
        {sidebarSections.map((section) => (
          <div key={section.title} className="mb-5">
            {collapsed ? (
              <div className="mx-auto mb-2 h-px w-6 bg-white/15" />
            ) : (
              <p className="mb-1.5 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/45">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <SidebarLink
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    collapsed={collapsed}
                    active={isActive(pathname, item.href)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className={cn("shrink-0 border-t border-white/10", collapsed ? "p-2" : "p-3")}>
        <SidebarLink
          href="/settings"
          label="Settings"
          icon={Settings}
          collapsed={collapsed}
          active={pathname.startsWith("/settings")}
        />
      </div>
    </aside>
  );
}

function SidebarHeader({ collapsed, onToggle }: SidebarProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center gap-2 overflow-hidden",
        collapsed ? "flex-col px-1 py-3" : "h-[4.25rem] px-4",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/25 via-transparent to-transparent"
        aria-hidden
      />
      <PeacockFeather className="relative h-8 w-6 shrink-0 text-accent-soft" />
      {collapsed ? null : (
        <div className="relative min-w-0">
          <p className="truncate text-base font-semibold tracking-tight">Velan Illam</p>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-accent-soft/90">
            Household
          </p>
        </div>
      )}
      <button
        type="button"
        className={cn(
          "relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white hover:bg-white/10",
          collapsed ? "" : "ml-auto",
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        onClick={onToggle}
      >
        {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </button>
    </div>
  );
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  collapsed,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  collapsed: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={cn(
        "group flex min-h-12 items-center rounded-xl text-sm font-medium transition-all duration-fast",
        collapsed ? "justify-center px-0" : "gap-2.5 px-3",
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
      {collapsed ? null : label}
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}
