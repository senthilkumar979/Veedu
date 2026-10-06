"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { onboardingSchema } from "@veedu/domain";
import { Button, Card, CardContent, Input, Select } from "@veedu/ui";
import { useAuth } from "@/lib/auth";

type Values = z.infer<typeof onboardingSchema>;

const steps = [
  "Create household",
  "Invite member",
  "Locations",
  "Preferences",
] as const;

export default function OnboardingPage() {
  const { completeOnboarding, isAuthenticated, isReady, profile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      household_name: "Our Home",
      member_name: "",
      member_email: "",
      home_location: "Antwerp",
      parents_location: "Dindigul",
      currency: "EUR",
      timezone: "Europe/Brussels",
    },
  });

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) router.replace("/login");
  }, [isReady, isAuthenticated, router]);

  async function finish(values: Values) {
    setPending(true);
    setError(null);
    try {
      await completeOnboarding(values);
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not finish onboarding");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardContent className="space-y-6 py-8">
          <div>
            <p className="text-sm font-medium text-primary">Welcome to Veedu</p>
            <h1 className="mt-1 text-2xl font-bold text-ink">
              Set up your household
            </h1>
            <p className="mt-1 text-sm text-muted">
              Hi {profile?.full_name?.split(" ")[0] ?? "there"} — this takes a
              minute.
            </p>
          </div>

          <ol className="flex flex-wrap gap-2">
            {steps.map((label, i) => (
              <li
                key={label}
                className={`rounded-pill px-3 py-1 text-xs font-medium ${
                  i === step
                    ? "bg-primary text-white"
                    : i < step
                      ? "bg-primary-soft text-primary"
                      : "bg-surface-subtle text-muted"
                }`}
              >
                {label}
              </li>
            ))}
          </ol>

          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => {
              if (step < steps.length - 1) setStep((s) => s + 1);
              else void finish(values);
            })}
          >
            {step === 0 ? (
              <Input
                label="Household name"
                error={form.formState.errors.household_name?.message}
                {...form.register("household_name")}
              />
            ) : null}

            {step === 1 ? (
              <>
                <Input
                  label="Second member name"
                  hint="Optional — invite later from Settings"
                  {...form.register("member_name")}
                />
                <Input
                  label="Second member email"
                  type="email"
                  {...form.register("member_email")}
                />
              </>
            ) : null}

            {step === 2 ? (
              <>
                <Input
                  label="Home location"
                  error={form.formState.errors.home_location?.message}
                  {...form.register("home_location")}
                />
                <Input
                  label="Parents location"
                  {...form.register("parents_location")}
                />
              </>
            ) : null}

            {step === 3 ? (
              <>
                <Select
                  label="Currency"
                  value={form.watch("currency")}
                  onValueChange={(v) => form.setValue("currency", v)}
                  options={[
                    { value: "EUR", label: "EUR · Euro" },
                    { value: "USD", label: "USD · US Dollar" },
                    { value: "INR", label: "INR · Indian Rupee" },
                    { value: "GBP", label: "GBP · Pound" },
                  ]}
                />
                <Select
                  label="Timezone"
                  value={form.watch("timezone")}
                  onValueChange={(v) => form.setValue("timezone", v)}
                  options={[
                    { value: "Europe/Brussels", label: "Europe/Brussels" },
                    { value: "Asia/Kolkata", label: "Asia/Kolkata" },
                    { value: "America/New_York", label: "America/New_York" },
                    { value: "UTC", label: "UTC" },
                  ]}
                />
              </>
            ) : null}

            {error ? (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex justify-between gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                disabled={step === 0 || pending}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                Back
              </Button>
              <Button type="submit" disabled={pending}>
                {step === steps.length - 1
                  ? pending
                    ? "Opening…"
                    : "Open dashboard"
                  : "Continue"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
