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
import {
  createSupabaseClient,
  getDemoStore,
  hasSupabaseEnv,
  resetDemoStore,
  uid,
  type DemoStore,
} from "@veedu/api";
import type { Household, Profile } from "@veedu/types";

const DEMO_SESSION_KEY = "veedu.demo.session";
const DEMO_ONBOARDING_KEY = "veedu.demo.onboarded";

export type AuthMode = "demo" | "supabase" | "guest";

interface AuthContextValue {
  mode: AuthMode;
  isReady: boolean;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  profile: Profile | null;
  household: Household | null;
  store: DemoStore | null;
  signInDemo: () => void;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  completeOnboarding: (input: {
    household_name: string;
    member_name?: string;
    member_email?: string;
    home_location: string;
    parents_location?: string;
    currency: string;
    timezone: string;
  }) => Promise<void>;
  refreshStore: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [mode, setMode] = useState<AuthMode>("guest");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [store, setStore] = useState<DemoStore | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const supabaseConfigured = hasSupabaseEnv();

  const hydrateDemo = useCallback(() => {
    const demo = getDemoStore();
    setStore(demo);
    setProfile(demo.profile);
    setHousehold(demo.household);
    setMode("demo");
    const onboarded =
      typeof window !== "undefined" &&
      localStorage.getItem(DEMO_ONBOARDING_KEY) === "1";
    setIsOnboarded(onboarded || true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      if (typeof window === "undefined") return;

      if (!supabaseConfigured) {
        const demoSession = localStorage.getItem(DEMO_SESSION_KEY);
        if (demoSession === "1") {
          hydrateDemo();
        }
        if (!cancelled) setIsReady(true);
        return;
      }

      const client = createSupabaseClient();
      if (!client) {
        if (!cancelled) setIsReady(true);
        return;
      }

      const { data } = await client.auth.getSession();
      if (data.session?.user) {
        setMode("supabase");
        const { data: profileRow } = await client
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .maybeSingle();
        if (profileRow) setProfile(profileRow as Profile);

        const { data: membership } = await client
          .from("household_members")
          .select("household_id, households(*)")
          .eq("user_id", data.session.user.id)
          .eq("status", "active")
          .maybeSingle();

        if (membership?.households) {
          setHousehold(membership.households as unknown as Household);
          setIsOnboarded(true);
        }
      }
      if (!cancelled) setIsReady(true);
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [hydrateDemo, supabaseConfigured]);

  const signInDemo = useCallback(() => {
    localStorage.setItem(DEMO_SESSION_KEY, "1");
    localStorage.setItem(DEMO_ONBOARDING_KEY, "1");
    hydrateDemo();
  }, [hydrateDemo]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabaseConfigured) {
        if (email.toLowerCase().includes("demo") || password.length >= 8) {
          signInDemo();
          return {};
        }
        return { error: "Use demo@veedu.app or enable Supabase env vars." };
      }
      const client = createSupabaseClient();
      if (!client) return { error: "Supabase not configured" };
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      window.location.href = "/";
      return {};
    },
    [signInDemo, supabaseConfigured],
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      if (!supabaseConfigured) {
        const demo = resetDemoStore();
        demo.profile.email = email;
        demo.profile.full_name = fullName;
        localStorage.setItem(DEMO_SESSION_KEY, "1");
        localStorage.removeItem(DEMO_ONBOARDING_KEY);
        setStore(demo);
        setProfile(demo.profile);
        setHousehold(null);
        setIsOnboarded(false);
        setMode("demo");
        return {};
      }
      const client = createSupabaseClient();
      if (!client) return { error: "Supabase not configured" };
      const { error } = await client.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) return { error: error.message };
      return {};
    },
    [supabaseConfigured],
  );

  const signOut = useCallback(async () => {
    localStorage.removeItem(DEMO_SESSION_KEY);
    if (supabaseConfigured) {
      const client = createSupabaseClient();
      await client?.auth.signOut();
    }
    setMode("guest");
    setProfile(null);
    setHousehold(null);
    setStore(null);
    setIsOnboarded(false);
  }, [supabaseConfigured]);

  const completeOnboarding = useCallback(
    async (input: {
      household_name: string;
      member_name?: string;
      member_email?: string;
      home_location: string;
      parents_location?: string;
      currency: string;
      timezone: string;
    }) => {
      if (mode === "demo" || !supabaseConfigured) {
        const demo = getDemoStore();
        demo.household.name = input.household_name;
        demo.household.home_location = input.home_location;
        demo.household.parents_location = input.parents_location || null;
        demo.household.currency = input.currency;
        demo.household.timezone = input.timezone;
        if (input.member_name) {
          demo.members[1] = {
            ...demo.members[1],
            id: uid("m"),
            display_name: input.member_name,
          };
        }
        localStorage.setItem(DEMO_ONBOARDING_KEY, "1");
        setHousehold(demo.household);
        setStore({ ...demo });
        setIsOnboarded(true);
        return;
      }

      const client = createSupabaseClient();
      if (!client || !profile) throw new Error("Not authenticated");
      const { data: householdRow, error } = await client
        .from("households")
        .insert({
          name: input.household_name,
          home_location: input.home_location,
          parents_location: input.parents_location || null,
          currency: input.currency,
          timezone: input.timezone,
          created_by: profile.id,
        })
        .select("*")
        .single();
      if (error) throw error;
      await client.from("household_members").insert({
        household_id: householdRow.id,
        user_id: profile.id,
        role: "owner",
        status: "active",
        display_name: profile.full_name,
      });
      setHousehold(householdRow as Household);
      setIsOnboarded(true);
    },
    [mode, profile, supabaseConfigured],
  );

  const refreshStore = useCallback(() => {
    if (mode === "demo") setStore({ ...getDemoStore() });
  }, [mode]);

  const value = useMemo<AuthContextValue>(
    () => ({
      mode,
      isReady,
      isAuthenticated: mode !== "guest" && Boolean(profile),
      isOnboarded,
      profile,
      household,
      store,
      signInDemo,
      signIn,
      signUp,
      signOut,
      completeOnboarding,
      refreshStore,
    }),
    [
      mode,
      isReady,
      isOnboarded,
      profile,
      household,
      store,
      signInDemo,
      signIn,
      signUp,
      signOut,
      completeOnboarding,
      refreshStore,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
