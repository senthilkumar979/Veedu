"use client";

import { Bell, Plus, Search } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownTrigger,
} from "@veedu/ui";
import { useAuth } from "@/lib/auth";

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenCommand: () => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
}

export function Header({
  onOpenSearch,
  onOpenCommand,
  onOpenNotifications,
  unreadCount = 0,
}: HeaderProps) {
  const { profile, household, signOut, mode } = useAuth();
  const initials =
    profile?.full_name
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "V";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur md:px-6">
      <div className="md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-bold text-white">
          V
        </div>
      </div>

      <div className="hidden min-w-0 flex-1 md:block">
        <p className="truncate text-sm font-medium text-ink">
          {household?.name ?? "Veedu"}
        </p>
        <p className="truncate text-xs text-muted">
          {mode === "demo" ? "Demo mode · local seed data" : "Live household"}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="hidden sm:inline-flex"
          onClick={onOpenSearch}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
          <span className="text-muted">Search</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenCommand}
          aria-label="Command palette"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Quick Add</span>
          <kbd className="hidden rounded border border-border px-1.5 text-[10px] text-muted lg:inline">
            ⌘K
          </kbd>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="relative px-2"
          onClick={onOpenNotifications}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <Badge
              tone="danger"
              className="absolute -right-0.5 -top-0.5 h-4 min-w-4 justify-center px-1"
            >
              {unreadCount}
            </Badge>
          ) : null}
        </Button>

        <Dropdown>
          <DropdownTrigger asChild>
            <button
              type="button"
              className="rounded-full"
              aria-label="Account menu"
            >
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownTrigger>
          <DropdownContent align="end">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-ink">
                {profile?.full_name}
              </p>
              <p className="text-xs text-muted">{profile?.email}</p>
            </div>
            <DropdownSeparator />
            <DropdownItem onSelect={() => void signOut()}>
              Sign out
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>
    </header>
  );
}
