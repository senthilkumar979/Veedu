"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authSchema } from "@veedu/domain";
import { Button, Card, CardContent, Input } from "@veedu/ui";
import { PeacockFeather } from "@/components/brand/motifs";
import { useAuth } from "@/lib/auth";

const loginSchema = authSchema.pick({ email: true, password: true });
const signupSchema = authSchema;

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

export default function LoginPage() {
  const {
    signIn,
    signUp,
    isAuthenticated,
    isOnboarded,
    isReady,
    supabaseConfigured,
  } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", full_name: "" },
  });

  useEffect(() => {
    if (!isReady || !isAuthenticated) return;
    router.replace(isOnboarded ? "/" : "/onboarding");
  }, [isReady, isAuthenticated, isOnboarded, router]);

  async function onLogin(values: LoginValues) {
    setPending(true);
    setFormError(null);
    const res = await signIn(values.email, values.password);
    setPending(false);
    if (res.error) {
      setFormError(res.error);
      return;
    }
    router.replace(res.isOnboarded ? "/" : "/onboarding");
  }

  async function onSignup(values: SignupValues) {
    setPending(true);
    setFormError(null);
    const res = await signUp(
      values.email,
      values.password,
      values.full_name || "Household member",
    );
    setPending(false);
    if (res.error) {
      setFormError(res.error);
      return;
    }
    router.replace(res.isOnboarded ? "/" : "/onboarding");
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-background bg-[url('/brand/dashboard-bg.png')] bg-cover bg-center px-4">
      <Card className="relative z-10 w-full max-w-md">
        <CardContent className="space-y-6 py-8">
          <div className="text-center">
            <PeacockFeather className="mx-auto mb-3 h-14 w-10 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              Velan Illam
            </h1>
            <p className="mt-1 text-sm text-muted">
              Your household is under control.
            </p>
          </div>

          {!supabaseConfigured ? (
            <p
              className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger"
              role="alert"
            >
              Supabase env vars are missing. Set{" "}
              <code className="text-ink">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="text-ink">
                NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
              </code>{" "}
              in <code className="text-ink">apps/web/.env.local</code>, then
              restart the dev server.
            </p>
          ) : null}

          <div className="flex rounded-lg bg-surface-subtle p-1">
            <button
              type="button"
              className={`min-h-12 flex-1 rounded-md text-sm font-medium ${mode === "login" ? "bg-surface text-primary shadow-card" : "text-muted"}`}
              onClick={() => setMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`min-h-12 flex-1 rounded-md text-sm font-medium ${mode === "signup" ? "bg-surface text-primary shadow-card" : "text-muted"}`}
              onClick={() => setMode("signup")}
            >
              Create account
            </button>
          </div>

          {mode === "login" ? (
            <form
              className="space-y-3"
              onSubmit={loginForm.handleSubmit(onLogin)}
            >
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                error={loginForm.formState.errors.email?.message}
                {...loginForm.register("email")}
              />
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                error={loginForm.formState.errors.password?.message}
                {...loginForm.register("password")}
              />
              {formError ? (
                <p className="text-sm text-danger" role="alert">
                  {formError}
                </p>
              ) : null}
              <Button
                type="submit"
                className="w-full"
                disabled={pending || !supabaseConfigured}
              >
                {pending ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          ) : (
            <form
              className="space-y-3"
              onSubmit={signupForm.handleSubmit(onSignup)}
            >
              <Input
                label="Full name"
                error={signupForm.formState.errors.full_name?.message}
                {...signupForm.register("full_name")}
              />
              <Input
                label="Email"
                type="email"
                error={signupForm.formState.errors.email?.message}
                {...signupForm.register("email")}
              />
              <Input
                label="Password"
                type="password"
                error={signupForm.formState.errors.password?.message}
                {...signupForm.register("password")}
              />
              {formError ? (
                <p className="text-sm text-danger" role="alert">
                  {formError}
                </p>
              ) : null}
              <Button
                type="submit"
                className="w-full"
                disabled={pending || !supabaseConfigured}
              >
                {pending ? "Creating…" : "Create account"}
              </Button>
            </form>
          )}

          {supabaseConfigured ? (
            <p className="text-center text-xs text-subtle">
              Create an account, then complete onboarding for your live
              household.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
