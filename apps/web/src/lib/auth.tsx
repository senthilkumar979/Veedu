"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createSupabaseClient, hasSupabaseEnv } from "@veedu/api";
import type { Household, Profile } from "@veedu/types";
import { liveUpdateHousehold } from "./household/live-patch";

const LEGACY_DEMO_SESSION_KEY = "veedu.demo.session";
const LEGACY_DEMO_ONBOARDING_KEY = "veedu.demo.onboarded";

export type AuthMode = "supabase" | "guest";

export interface AuthActionResult {
  error?: string;
  isOnboarded?: boolean;
}

function clearLegacyDemoKeys() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LEGACY_DEMO_SESSION_KEY);
  localStorage.removeItem(LEGACY_DEMO_ONBOARDING_KEY);
}

interface AuthContextValue {
  mode: AuthMode;
  isReady: boolean;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  supabaseConfigured: boolean;
  profile: Profile | null;
  household: Household | null;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<AuthActionResult>;
  signOut: () => Promise<void>;
  completeOnboarding: (input: {
    household_name: string;
    member_name?: string;
    member_email?: string;
    home_location: string;
    parents_location?: string;
    parents_locations?: { label: string; place: string }[];
    currency: string;
    timezone: string;
  }) => Promise<void>;
  updateHousehold: (
    patch: Partial<
      Pick<
        Household,
        | "name"
        | "home_location"
        | "parents_location"
        | "parents_locations"
        | "timezone"
        | "currency"
      >
    >,
  ) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfileWithRetry(
  userId: string,
  attempts = 5,
): Promise<Profile | null> {
  const client = createSupabaseClient();
  if (!client) return null;

  for (let i = 0; i < attempts; i++) {
    const { data } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (data) return data as Profile;
    await new Promise((r) => setTimeout(r, 150 * (i + 1)));
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [mode, setMode] = useState<AuthMode>("guest");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const supabaseConfigured = hasSupabaseEnv();

  const hydrateSupabaseUser = useCallback(async (userId: string) => {
    clearLegacyDemoKeys();
    setMode("supabase");

    const profileRow = await fetchProfileWithRetry(userId);
    if (!profileRow) {
      setProfile(null);
      setHousehold(null);
      setIsOnboarded(false);
      return { isOnboarded: false, profileReady: false as const };
    }
    setProfile(profileRow);

    const client = createSupabaseClient();
    let onboarded = false;
    if (client) {
      const { data: membership } = await client
        .from("household_members")
        .select("household_id, households(*)")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();

      if (membership?.households) {
        setHousehold(membership.households as unknown as Household);
        setIsOnboarded(true);
        onboarded = true;
      } else {
        setHousehold(null);
        setIsOnboarded(false);
      }
    }

    return { isOnboarded: onboarded, profileReady: true as const };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      if (typeof window === "undefined") return;
      clearLegacyDemoKeys();

      if (!supabaseConfigured) {
        if (!cancelled) setIsReady(true);
        return;
      }

      const client = createSupabaseClient();
      if (!client) {
        if (!cancelled) setIsReady(true);
        return;
      }

      const { data } = await client.auth.getSession();
      if (data.session?.user && !cancelled) {
        await hydrateSupabaseUser(data.session.user.id);
      }
      if (!cancelled) setIsReady(true);
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [hydrateSupabaseUser, supabaseConfigured]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      if (!supabaseConfigured) {
        return {
          error:
            "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
        };
      }
      const client = createSupabaseClient();
      if (!client) return { error: "Supabase not configured" };
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: error.message };
      if (!data.session?.user) {
        return { error: "Sign-in succeeded but no session was created." };
      }
      const result = await hydrateSupabaseUser(data.session.user.id);
      if (!result.profileReady) {
        return {
          error:
            "Signed in, but your profile is missing. Apply Supabase migrations (profile trigger), then try again.",
        };
      }
      return { isOnboarded: result.isOnboarded };
    },
    [hydrateSupabaseUser, supabaseConfigured],
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
    ): Promise<AuthActionResult> => {
      if (!supabaseConfigured) {
        return {
          error:
            "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
        };
      }
      const client = createSupabaseClient();
      if (!client) return { error: "Supabase not configured" };
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) return { error: error.message };
      if (!data.session?.user) {
        return {
          error:
            "Check your email to confirm your account, then sign in. For local smoke tests, turn off Confirm email in Supabase Auth (or push supabase/config.toml with auth.email.enable_confirmations = false).",
        };
      }
      const result = await hydrateSupabaseUser(data.session.user.id);
      if (!result.profileReady) {
        return {
          error:
            "Account created, but your profile is missing. Apply Supabase migrations (profile trigger), then sign in.",
        };
      }
      return { isOnboarded: result.isOnboarded };
    },
    [hydrateSupabaseUser, supabaseConfigured],
  );

  const signOut = useCallback(async () => {
    clearLegacyDemoKeys();
    if (supabaseConfigured) {
      const client = createSupabaseClient();
      await client?.auth.signOut();
    }
    setMode("guest");
    setProfile(null);
    setHousehold(null);
    setIsOnboarded(false);
  }, [supabaseConfigured]);

  const completeOnboarding = useCallback(
    async (input: {
      household_name: string;
      member_name?: string;
      member_email?: string;
      home_location: string;
      parents_location?: string;
      parents_locations?: { label: string; place: string }[];
      currency: string;
      timezone: string;
    }) => {
      const client = createSupabaseClient();
      if (!client || !profile) throw new Error("Not authenticated");
      const parents_locations = (input.parents_locations ?? [])
        .filter((p) => p.place.trim())
        .slice(0, 2);
      const { data: householdRow, error } = await client
        .from("households")
        .insert({
          name: input.household_name,
          home_location: input.home_location,
          parents_location:
            parents_locations[0]?.place || input.parents_location || null,
          parents_locations,
          currency: input.currency,
          timezone: input.timezone,
          created_by: profile.id,
        })
        .select("*")
        .single();
      if (error) throw error;
      const { error: memberError } = await client
        .from("household_members")
        .insert({
          household_id: householdRow.id,
          user_id: profile.id,
          role: "owner",
          status: "active",
          display_name: profile.full_name,
        });
      if (memberError) throw memberError;

      if (input.member_email?.trim()) {
        const token = Array.from(crypto.getRandomValues(new Uint8Array(24)))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        await client.from("household_invites").insert({
          household_id: householdRow.id,
          email: input.member_email.trim().toLowerCase(),
          token,
          invited_by: profile.id,
          status: "pending",
        });
      }

      setHousehold(householdRow as Household);
      setIsOnboarded(true);
    },
    [profile],
  );

  const updateHousehold = useCallback(
    async (
      patch: Partial<
        Pick<
          Household,
          | "name"
          | "home_location"
          | "parents_location"
          | "parents_locations"
          | "timezone"
          | "currency"
        >
      >,
    ) => {
      try {
        if (!household) return { error: "No household loaded" };
        const next = await liveUpdateHousehold(household.id, patch);
        setHousehold(next);
        return {};
      } catch (e) {
        return {
          error: e instanceof Error ? e.message : "Could not update household",
        };
      }
    },
    [household],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      mode,
      isReady,
      isAuthenticated: mode === "supabase" && Boolean(profile),
      isOnboarded,
      supabaseConfigured,
      profile,
      household,
      signIn,
      signUp,
      signOut,
      completeOnboarding,
      updateHousehold,
    }),
    [
      mode,
      isReady,
      isOnboarded,
      supabaseConfigured,
      profile,
      household,
      signIn,
      signUp,
      signOut,
      completeOnboarding,
      updateHousehold,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
