"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Button,
} from "@veedu/ui";
import { DEFAULT_CURRENCY, resolveCurrency } from "@veedu/types";
import { PageContainer } from "@/components/layout/page-container";
import { CurrencySelect } from "@/components/shared/currency-select";
import { GoogleIntegrationsPanel } from "@/components/settings/google-integrations";
import { PushNotificationsPanel } from "@/components/settings/push-notifications";
import { useAuth } from "@/lib/auth";
import {
  parentLocationsForSave,
  resolveParentLocations,
} from "@/lib/household/parent-locations";

interface HouseholdForm {
  name: string;
  home_location: string;
  parent_a_label: string;
  parent_a_place: string;
  parent_b_label: string;
  parent_b_place: string;
  timezone: string;
  currency: string;
}

export default function SettingsPage() {
  const { household, signOut, updateHousehold } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const form = useForm<HouseholdForm>({
    defaultValues: {
      name: "",
      home_location: "",
      parent_a_label: "Amma",
      parent_a_place: "",
      parent_b_label: "Appa",
      parent_b_place: "",
      timezone: "Europe/Brussels",
      currency: DEFAULT_CURRENCY,
    },
  });

  useEffect(() => {
    if (!household) return;
    const parents = resolveParentLocations(household);
    form.reset({
      name: household.name,
      home_location: household.home_location ?? "",
      parent_a_label: parents[0]?.label ?? "Amma",
      parent_a_place: parents[0]?.place ?? "",
      parent_b_label: parents[1]?.label ?? "Appa",
      parent_b_place: parents[1]?.place ?? "",
      timezone: household.timezone,
      currency: resolveCurrency(household.currency),
    });
  }, [household, form]);

  return (
    <PageContainer title="Settings" description="Keep settings intentionally simple">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Household</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(async (values) => {
                setPending(true);
                setMessage(null);
                setError(null);
                const parentSave = parentLocationsForSave([
                  {
                    label: values.parent_a_label,
                    place: values.parent_a_place,
                  },
                  {
                    label: values.parent_b_label,
                    place: values.parent_b_place,
                  },
                ]);
                const res = await updateHousehold({
                  name: values.name.trim(),
                  home_location: values.home_location.trim() || null,
                  ...parentSave,
                  timezone: values.timezone.trim() || "Europe/Brussels",
                  currency: resolveCurrency(values.currency),
                });
                setPending(false);
                if (res.error) setError(res.error);
                else setMessage("Household saved.");
              })}
            >
              <Input label="Household name" {...form.register("name", { required: true })} />
              <Input label="Home location" {...form.register("home_location")} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Parent 1 name" {...form.register("parent_a_label")} />
                <Input label="Parent 1 city" {...form.register("parent_a_place")} />
                <Input label="Parent 2 name" {...form.register("parent_b_label")} />
                <Input label="Parent 2 city" {...form.register("parent_b_place")} />
              </div>
              <Input label="Timezone" {...form.register("timezone")} />
              <CurrencySelect
                label="Preferred currency"
                value={form.watch("currency")}
                onValueChange={(v) => form.setValue("currency", v)}
              />
              {error ? (
                <p className="text-sm text-danger" role="alert">
                  {error}
                </p>
              ) : null}
              {message ? (
                <p className="text-sm text-success" role="status">
                  {message}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" disabled={pending || !household}>
                  {pending ? "Saving…" : "Save household"}
                </Button>
                <Badge tone="primary">Live Supabase</Badge>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted">
              View household profiles on the{" "}
              <a href="/family" className="font-medium text-ink underline">
                Family
              </a>{" "}
              page. Invites are disabled.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <PushNotificationsPanel />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance & Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted">
            <p>
              Light theme ships first. Dark tokens are ready via
              data-theme=&quot;dark&quot;.
            </p>
            <p>
              Accounts never store passwords, PINs, CVVs, OTPs, or recovery
              codes.
            </p>
            <Button variant="secondary" onClick={() => void signOut()}>
              Sign out
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Integrations & Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted">
            <p>
              <strong className="text-ink">Live:</strong> Open-Meteo weather,
              VAPID web push, Gemini AI when{" "}
              <code className="text-ink">GEMINI_API_KEY</code> is set.
            </p>
            <GoogleIntegrationsPanel />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
