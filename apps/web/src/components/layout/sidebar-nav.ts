import {
  Activity,
  Banknote,
  Bot,
  CalendarClock,
  CalendarDays,
  CheckSquare,
  Contact,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  MapPin,
  PenLine,
  Radar,
  Receipt,
  Star,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export const sidebarSections: SidebarSection[] = [
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
];
