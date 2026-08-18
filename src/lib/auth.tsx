import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
  signOut: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);
const SESSION_KEY = "helpdesk-lite:session";

export const DEMO_PASSWORD = "Demo123!";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const id = window.localStorage.getItem(SESSION_KEY);
      const found = id ? db.users.find((u) => u.id === id) : null;
      if (found) setUser(hydrate(found));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const found = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) throw new Error("No account found with that email address.");
    if (password !== DEMO_PASSWORD) throw new Error("Incorrect password. Try Demo123!");
    const session = hydrate(found);
    window.localStorage.setItem(SESSION_KEY, session.id);
    setUser(session);
    return session;
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
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
