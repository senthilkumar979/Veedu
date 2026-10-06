"use client";

import Link from "next/link";
import { Card, CardContent } from "@veedu/ui";
import { PageContainer } from "@/components/layout/page-container";
import {
  Bot, Contact, CreditCard, Home, MapPin, Receipt, Settings, Star, Wallet, Radar, PenLine,
} from "lucide-react";

const links = [
  { href: "/bills", label: "Bills", icon: Receipt },
  { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/contacts", label: "Contacts", icon: Contact },
  { href: "/places", label: "Places", icon: MapPin },
  { href: "/important-dates", label: "Important Dates", icon: Star },
  { href: "/home", label: "Home", icon: Home },
  { href: "/ai/assistant", label: "AI Assistant", icon: Bot },
  { href: "/ai/tech-radar", label: "Tech Radar", icon: Radar },
  { href: "/ai/content", label: "Content", icon: PenLine },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function MorePage() {
  return (
    <PageContainer title="More" description="Everything else in Veedu">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <Link key={l.href} href={l.href}>
              <Card className="h-full hover:bg-surface-hover">
                <CardContent className="flex flex-col items-start gap-2 py-5">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-ink">{l.label}</span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}
