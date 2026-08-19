import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Inbox,
  LayoutGrid,
  ListFilter,
  LogOut,
  Menu,
  PlusCircle,
  Search,
  X,
} from "lucide-react";
import { capabilitiesFor, useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Avatar } from "./indicators";

export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

function navFor(role: ReturnType<typeof capabilitiesFor>, isEmployee: boolean): NavItem[] {
  const items: NavItem[] = [{ to: "/dashboard", label: "Dashboard", icon: LayoutGrid }];
  if (isEmployee || role.canCreate) items.push({ to: "/my-requests", label: "My Requests", icon: ListFilter });
  if (role.canSeeAll) items.push({ to: "/requests", label: "All Requests", icon: Inbox });
  if (role.hasQueue) items.push({ to: "/assigned", label: "Assigned to Me", icon: Inbox });
  if (role.canCreate)
    items.push({ to: "/requests/new", label: "Create Request", icon: PlusCircle, badge: "New" });
  if (role.canSeeAnalytics) items.push({ to: "/analytics", label: "Analytics", icon: BarChart3 });
  return items;
}

export function AppShell({
  title,
  breadcrumb,
  children,
  search,
  onSearchChange,
}: {
  title: string;
  breadcrumb?: string;
  children: React.ReactNode;
  search?: string;
  onSearchChange?: (v: string) => void;
}) {
  const { user, ready, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  useEffect(() => {
    if (ready && !user) navigate({ to: "/", replace: true });
  }, [ready, user, navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  const caps = capabilitiesFor(user.role);
  const items = navFor(caps, user.role === "Employee");

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <Inbox className="size-4" />
        </span>
        <div>
          <p className="text-sm font-bold">HelpDesk Lite</p>
          <p className="text-[11px] text-sidebar-muted">Internal Support</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        <p className="label-caps px-3 pb-2 text-sidebar-muted">Workspace</p>
        {items.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="rounded-md bg-sidebar-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-sidebar-primary-foreground">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar initials={user.initials} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-[11px] text-sidebar-muted">
              {user.role}
              {user.teamName ? ` · ${user.teamName}` : ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            await queryClient.cancelQueries();
            queryClient.clear();
            await signOut();
            navigate({ to: "/", replace: true });
          }}
          className="mt-4 flex w-full items-center gap-2 rounded-lg px-1 py-2 text-sm text-sidebar-muted transition-colors hover:text-sidebar-foreground"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-60">{sidebar}</div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 shadow-drawer">
            <button
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-3 text-sidebar-muted"
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>

          <div className="min-w-0 flex-1 text-sm">
            {breadcrumb ? <span className="text-muted-foreground">{breadcrumb} / </span> : null}
            <span className="font-semibold">{title}</span>
          </div>

          <div className="relative hidden max-w-xs flex-1 md:block">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={onSearchChange ? (search ?? "") : globalSearch}
              onChange={(e) => {
                if (onSearchChange) onSearchChange(e.target.value);
                else setGlobalSearch(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !onSearchChange && globalSearch.trim()) {
                  navigate({ to: "/requests", search: { q: globalSearch.trim() } });
                }
              }}
              placeholder="Search requests..."
              className="w-full rounded-full border border-border bg-secondary py-2 pr-3 pl-9 text-sm outline-none focus:border-primary focus:bg-card"
            />
          </div>

          <div className="flex items-center gap-2">
            <Avatar initials={user.initials} className="size-8" />
            <div className="hidden text-right sm:block">
              <p className="text-sm leading-tight font-semibold">{user.name}</p>
              <p className="text-[11px] text-muted-foreground">{user.role}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
