import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/hd/AppShell";
import { getDashboardStats } from "@/lib/data-service";
import { useAuth } from "@/lib/auth";
import { DonutChart } from "@/components/hd/DonutChart";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — HelpDesk Lite" },
      {
        name: "description",
        content: "Volume, priority mix and team workload across all internal support requests.",
      },
      { property: "og:title", content: "Analytics — HelpDesk Lite" },
      {
        property: "og:description",
        content: "Volume, priority mix and team workload across all internal support requests.",
      },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats", "all"],
    queryFn: () => getDashboardStats({}),
    enabled: !!user,
  });

  const total = stats?.total ?? 0;
  const resolutionRate = total ? Math.round(((stats!.resolved + stats!.closed) / total) * 100) : 0;

  return (
    <AppShell title="Analytics" breadcrumb="Workspace">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A live read on request volume, urgency and where the work sits.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="surface-card h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Kpi label="Total requests" value={String(total)} />
              <Kpi label="Resolution rate" value={`${resolutionRate}%`} />
              <Kpi label="Needs attention" value={String(stats?.needsAttention ?? 0)} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title="Priority mix">
                <DonutChart
                  data={Object.entries(stats?.byPriority ?? {}).map(([label, value]) => ({
                    label,
                    value,
                  }))}
                />
              </Panel>
              <Panel title="Status distribution">
                <DonutChart
                  data={Object.entries(stats?.byStatus ?? {}).map(([label, value]) => ({
                    label,
                    value,
                  }))}
                />
              </Panel>
              <Panel title="Requests by category">
                {(stats?.byCategory ?? []).map((c) => (
                  <Bar key={c.name} label={c.name} count={c.count} total={total} />
                ))}
              </Panel>
              <Panel title="Team workload (open / total)">
                {(stats?.teamWorkload ?? []).map((t) => (
                  <div key={t.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{t.name}</span>
                      <span className="text-muted-foreground">
                        {t.open} open · {t.total} total
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${total ? (t.total / total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </Panel>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-card p-5">
      <p className="label-caps">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface-card space-y-3 p-5">
      <p className="text-sm font-semibold">{title}</p>
      {children}
    </section>
  );
}

function Bar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {count} · {pct}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
