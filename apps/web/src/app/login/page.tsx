"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authSchema } from "@veedu/domain";
import { Button, Card, CardContent, Input } from "@veedu/ui";
import { useAuth } from "@/lib/auth";

const loginSchema = authSchema.pick({ email: true, password: true });
const signupSchema = authSchema;

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

export default function LoginPage() {
  const { signIn, signUp, signInDemo, isAuthenticated, isOnboarded, isReady } =
    useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "demo@veedu.app", password: "veedu1234" },
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
    if (res.error) setFormError(res.error);
    else router.replace("/");
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
    if (res.error) setFormError(res.error);
    else router.replace("/onboarding");
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary-soft),_transparent_55%),linear-gradient(180deg,_#f6f6f8_0%,_#eef0f8_100%)]"
      />
      <Card className="relative z-10 w-full max-w-md">
        <CardContent className="space-y-6 py-8">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">
              V
            </div>
            <h1 className="text-2xl font-bold text-ink">Veedu</h1>
            <p className="mt-1 text-sm text-muted">
              Your household is under control.
            </p>
          </div>

          <div className="flex rounded-lg bg-surface-subtle p-1">
            <button
              type="button"
              className={`flex-1 rounded-md py-2 text-sm font-medium ${mode === "login" ? "bg-surface text-ink shadow-sm" : "text-muted"}`}
              onClick={() => setMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`flex-1 rounded-md py-2 text-sm font-medium ${mode === "signup" ? "bg-surface text-ink shadow-sm" : "text-muted"}`}
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
              <Button type="submit" className="w-full" disabled={pending}>
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
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Creating…" : "Create account"}
              </Button>
            </form>
          )}

          <div className="relative py-1 text-center text-xs text-subtle">
            <span className="bg-surface px-2">or</span>
          </div>
          <Button
            variant="soft"
            className="w-full"
            onClick={() => {
              signInDemo();
              router.replace("/");
            }}
          >
            Continue with demo household
          </Button>
          <p className="text-center text-xs text-subtle">
            Without Supabase env vars, Veedu runs in demo mode with seed data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
