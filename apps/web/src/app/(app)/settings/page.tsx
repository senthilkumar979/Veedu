"use client";

import { Card, CardContent, CardHeader, CardTitle, Badge, Input, Button } from "@veedu/ui";
import { PageContainer } from "@/components/layout/page-container";
import { PushNotificationsPanel } from "@/components/settings/push-notifications";
import { useAuth } from "@/lib/auth";

export default function SettingsPage() {
  const { profile, household, mode, signOut } = useAuth();

  return (
    <PageContainer title="Settings" description="Keep settings intentionally simple">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Household</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input label="Household name" defaultValue={household?.name ?? ""} readOnly />
            <Input label="Home location" defaultValue={household?.home_location ?? ""} readOnly />
            <Input label="Parents location" defaultValue={household?.parents_location ?? ""} readOnly />
            <Input label="Timezone" defaultValue={household?.timezone ?? ""} readOnly />
            <Input label="Currency" defaultValue={household?.currency ?? ""} readOnly />
            <Badge tone="primary">{mode === "demo" ? "Demo mode" : "Live Supabase"}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Members</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium text-ink">{profile?.full_name}</p>
            <p className="text-muted">{profile?.email}</p>
            <p className="text-xs text-subtle">Invite/add second member from onboarding or future invite flow.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
          <CardContent>
            <PushNotificationsPanel />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Appearance & Security</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted">
            <p>Light theme ships first. Dark tokens are ready via data-theme=&quot;dark&quot;.</p>
            <p>Accounts never store passwords, PINs, CVVs, OTPs, or recovery codes.</p>
            <Button variant="secondary" onClick={() => void signOut()}>Sign out</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Integrations & Data</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted">
            <p>
              <strong className="text-ink">Live:</strong> Open-Meteo weather (home/parents place names geocoded), VAPID web push, Gemini AI when <code className="text-ink">GEMINI_API_KEY</code> is set.
            </p>
            <p>
              <strong className="text-ink">Planned:</strong> Google Calendar and Google Contacts — not implemented yet.
            </p>
            <p>
              Auth remains Supabase Auth only. Apply migrations in <code className="text-ink">supabase/migrations</code> for live push persistence.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
