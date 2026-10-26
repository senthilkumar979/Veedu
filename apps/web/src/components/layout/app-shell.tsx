"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNavigation } from "./mobile-navigation";
import { CommandPalette } from "./command-palette";
import { NotificationCenter } from "./notification-center";
import { GlobalSearch } from "./global-search";
import { useAuth } from "@/lib/auth";
import { useHouseholdData } from "@/lib/data";
import { Skeleton } from "@veedu/ui";

const SIDEBAR_STORAGE_KEY = "velan-sidebar-collapsed";

export function AppShell({ children }: { children: ReactNode }) {
  const { isReady, isAuthenticated, isOnboarded } = useAuth();
  const router = useRouter();
  const { notifications } = useHouseholdData();
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === "1") setSidebarCollapsed(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) router.replace("/login");
    else if (!isOnboarded) router.replace("/onboarding");
  }, [isReady, isAuthenticated, isOnboarded, router]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const unread = useMemo(
    () => (notifications.data ?? []).filter((n) => !n.read_at).length,
    [notifications.data],
  );

  if (!isReady || !isAuthenticated || !isOnboarded) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background pt-[env(safe-area-inset-top)] text-ink">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => {
          setSidebarCollapsed((collapsed) => {
            const next = !collapsed;
            window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "1" : "0");
            return next;
          });
        }}
      />
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          onOpenCommand={() => setCommandOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenNotifications={() => setNotifyOpen(true)}
          unreadCount={unread}
        />
        <main className="min-h-0 flex-1 overflow-y-auto bg-background bg-[url('/brand/dashboard-bg.png')] bg-cover bg-center pb-20 md:pb-3">
          {children}
        </main>
        <MobileNavigation />
      </div>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <NotificationCenter open={notifyOpen} onOpenChange={setNotifyOpen} />
    </div>
  );
}
