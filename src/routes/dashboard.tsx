import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Inbox } from "lucide-react";
import { AppShell } from "@/components/hd/AppShell";
import { TicketDrawer } from "@/components/hd/TicketDrawer";
import { TicketTable, TicketTableSkeleton } from "@/components/hd/TicketTable";
import { getDashboardStats, getTickets } from "@/lib/data-service";
import { capabilitiesFor, useAuth } from "@/lib/auth";
import type { TicketFilters } from "@/lib/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — HelpDesk Lite" },
      {
        name: "description",
        content: "Live view of open, in-progress and resolved internal support requests.",
      },
      { property: "og:title", content: "Dashboard — HelpDesk Lite" },
      {
        property: "og:description",
        content: "Live view of open, in-progress and resolved internal support requests.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const [openId, setOpenId] = useState<string | null>(null);

  const caps = user ? capabilitiesFor(user.role) : null;
  const scope: TicketFilters = !user
    ? {}
    : user.role === "Employee"
      ? { createdBy: user.id }
      : caps?.canSeeAll
        ? {}
        : { team: user.team_id ?? "all" };

  const { data: stats } = useQuery({
    queryKey: ["stats", scope],
    queryFn: () => getDashboardStats(scope),
    enabled: !!user,
  });
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["tickets", scope],
    queryFn: () => getTickets(scope),
    enabled: !!user,
  });

  const recent = (tickets ?? []).slice(0, 6);

  return (
    <AppShell title="Dashboard">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">
              Good to see you, {user?.name.split(" ")[0]}.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {user?.role === "Employee"
                ? "Here's the status of the requests you've submitted."
                : "Here's what your support workspace looks like right now."}
            </p>
          </div>
          {caps?.canCreate ? (
            <Link
              to="/requests/new"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              New request
            </Link>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total requests" value={stats?.total} icon={Inbox} tone="primary" />
          <StatCard label="Open" value={stats?.open} icon={Clock} tone="warning" />
          <StatCard label="Resolved" value={stats?.resolved} icon={CheckCircle2} tone="success" />
          <StatCard
            label="Needs attention"
            value={stats?.needsAttention}
            icon={AlertTriangle}
            tone="danger"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="surface-card p-5">
            <p className="text-sm font-semibold">Requests by status</p>
            <ul className="mt-4 space-y-3">
              {Object.entries(stats?.byStatus ?? {}).map(([name, count]) => (
                <BarRow key={name} label={name} count={count} total={stats?.total ?? 0} />
              ))}
            </ul>
          </section>
          <section className="surface-card p-5">
            <p className="text-sm font-semibold">
              {caps?.canSeeAll ? "Team workload" : "Requests by category"}
            </p>
            <ul className="mt-4 space-y-3">
              {(caps?.canSeeAll
                ? (stats?.teamWorkload ?? []).map((t) => ({ label: t.name, count: t.total }))
                : (stats?.byCategory ?? []).map((c) => ({ label: c.name, count: c.count }))
              ).map((row) => (
                <BarRow
                  key={row.label}
                  label={row.label}
                  count={row.count}
                  total={stats?.total ?? 0}
                />
              ))}
            </ul>
          </section>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent activity</h2>
            <Link
              to="/requests"
              search={{ q: "" }}
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {isLoading ? (
            <TicketTableSkeleton />
          ) : (
            <TicketTable
              tickets={recent}
              onOpen={setOpenId}
              emptyTitle="Nothing here yet"
              emptyBody="Requests will appear as soon as they're submitted."
            />
          )}
        </section>
      </div>

      <TicketDrawer ticketId={openId} onClose={() => setOpenId(null)} />
    </AppShell>
  );
}

const tones = {
  primary: "bg-primary/10 text-primary",
  warning: "bg-warning-soft text-warning-strong",
  success: "bg-success-soft text-success-strong",
  danger: "bg-destructive/10 text-destructive",
} as const;

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | undefined;
  icon: React.ComponentType<{ className?: string }>;
  tone: keyof typeof tones;
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between">
        <p className="label-caps">{label}</p>
        <span className={`flex size-8 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold">
        {value === undefined ? <span className="inline-block h-8 w-12 animate-pulse rounded bg-muted" /> : value}
      </p>
    </div>
  );
}

function BarRow({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <li>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {count} · {pct}%
        </span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-secondary">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </li>
  );
}
