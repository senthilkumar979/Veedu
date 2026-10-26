"use client";

import { format } from "date-fns";
import { Bell, Command, Search } from "lucide-react";
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
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-surface px-3 md:px-4">
      <div className="min-w-0 md:hidden">
        <p className="truncate text-sm font-semibold text-ink">Velan Illam</p>
        <p className="truncate text-xs text-muted">
          {household?.name ?? "Household"}
        </p>
      </div>

      <p className="hidden min-w-0 flex-1 truncate text-sm text-muted md:block">
        <span className="font-medium text-ink">{format(new Date(), "EEE d MMM")}</span>
        <span> · {format(new Date(), "HH:mm")}</span>
        {mode === "guest" ? <span className="text-warning"> · Guest</span> : null}
      </p>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-11 w-11 px-0"
          onClick={onOpenSearch}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenCommand}
          aria-label="Command palette"
          className="h-11 gap-2 rounded-xl"
        >
          <Command className="h-3.5 w-3.5" />
          <span className="hidden xl:inline">Quick add</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-11 w-11 px-0"
          onClick={onOpenNotifications}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <Badge
              tone="danger"
              className="absolute right-1 top-1 h-4 min-w-4 justify-center px-1"
            >
              {unreadCount}
            </Badge>
          ) : null}
        </Button>

        <Dropdown>
          <DropdownTrigger asChild>
            <button
              type="button"
              className="rounded-full ring-2 ring-transparent transition hover:ring-primary-soft"
              aria-label="Account menu"
            >
              <Avatar className="h-10 w-10">
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
