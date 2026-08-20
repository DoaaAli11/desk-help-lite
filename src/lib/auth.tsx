import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "./store";
import type { RoleName, User } from "./types";

export interface SessionUser extends User {
  role: RoleName;
  teamName: string | null;
  initials: string;
}

interface AuthValue {
  user: SessionUser | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<SessionUser>;
  signUp: (name: string, email: string, password: string) => Promise<SessionUser>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export const DEMO_PASSWORD = "HelpDesk!Lite2026";

export const demoAccounts: Array<{ email: string; role: RoleName; name: string }> = [
  { email: "employee@helpdesk.demo", role: "Employee", name: "Ahmed Hassan" },
  { email: "support@helpdesk.demo", role: "Support Staff", name: "Omar Khaled" },
  { email: "manager@helpdesk.demo", role: "Manager", name: "Youssef Ali" },
  { email: "operations@helpdesk.demo", role: "Product Operations", name: "Nour Ahmed" },
  { email: "engineer@helpdesk.demo", role: "Engineer", name: "Karim Samir" },
];

export function hydrate(user: User): SessionUser {
  const role = (db.roles.find((r) => r.id === user.role_id)?.name ?? "Employee") as RoleName;
  const teamName = db.teams.find((t) => t.id === user.team_id)?.name ?? null;
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return { ...user, role, teamName, initials };
}

/** Links the signed-in account to its directory record and loads it. */
async function loadSessionUser(): Promise<SessionUser | null> {
  const { data: linked, error: linkError } = await supabase.rpc("ensure_profile");
  if (linkError) throw new Error(linkError.message);
  if (!linked) return null;

  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("id", linked)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? hydrate(data as User) : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const resolve = async (hasSession: boolean) => {
      if (!hasSession) {
        if (active) setUser(null);
        return;
      }
      try {
        const next = await loadSessionUser();
        if (active) setUser(next);
      } catch {
        if (active) setUser(null);
      }
    };

    supabase.auth.getSession().then(async ({ data }) => {
      await resolve(!!data.session);
      if (active) setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        void resolve(!!session);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    let result = await supabase.auth.signInWithPassword({ email: cleanEmail, password });

    // Demo accounts are provisioned on first sign-in.
    const isDemo = demoAccounts.some((a) => a.email === cleanEmail);
    if (result.error && isDemo && password === DEMO_PASSWORD) {
      const signUp = await supabase.auth.signUp({ email: cleanEmail, password });
      if (signUp.error) throw new Error(signUp.error.message);
      result = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    }
    if (result.error) throw new Error("Incorrect email or password.");

    const session = await loadSessionUser();
    if (!session) {
      await supabase.auth.signOut();
      throw new Error("No HelpDesk account is linked to that email address.");
    }
    setUser(session);
    return session;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, signIn, signOut }), [user, ready, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/* ---- Role capabilities ---------------------------------------------- */

export interface Capabilities {
  canCreate: boolean;
  canSeeAll: boolean;
  canAssign: boolean;
  canChangeStatus: boolean;
  canSeeAnalytics: boolean;
  hasQueue: boolean;
}

export function capabilitiesFor(role: RoleName): Capabilities {
  switch (role) {
    case "Employee":
      return {
        canCreate: true,
        canSeeAll: false,
        canAssign: false,
        canChangeStatus: false,
        canSeeAnalytics: false,
        hasQueue: false,
      };
    case "Support Staff":
      return {
        canCreate: true,
        canSeeAll: true,
        canAssign: true,
        canChangeStatus: true,
        canSeeAnalytics: false,
        hasQueue: true,
      };
    case "Manager":
      return {
        canCreate: true,
        canSeeAll: true,
        canAssign: true,
        canChangeStatus: true,
        canSeeAnalytics: true,
        hasQueue: false,
      };
    case "Product Operations":
      return {
        canCreate: true,
        canSeeAll: true,
        canAssign: true,
        canChangeStatus: true,
        canSeeAnalytics: true,
        hasQueue: true,
      };
    case "Engineer":
      return {
        canCreate: true,
        canSeeAll: true,
        canAssign: false,
        canChangeStatus: true,
        canSeeAnalytics: false,
        hasQueue: true,
      };
  }
}
