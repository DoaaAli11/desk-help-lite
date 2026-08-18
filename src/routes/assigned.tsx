import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/hd/AppShell";
import { TicketDrawer } from "@/components/hd/TicketDrawer";
import { TicketTable, TicketTableSkeleton } from "@/components/hd/TicketTable";
import { RequestFilters, useRequestFilters } from "@/components/hd/RequestFilters";
import { getTickets } from "@/lib/data-service";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assigned")({
  head: () => ({
    meta: [
      { title: "Assigned to me — HelpDesk Lite" },
      { name: "description", content: "Your personal support queue and your team's open work." },
      { property: "og:title", content: "Assigned to me — HelpDesk Lite" },
      {
        property: "og:description",
        content: "Your personal support queue and your team's open work.",
      },
    ],
  }),
  component: AssignedPage,
});

function AssignedPage() {
  const { user } = useAuth();
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<"me" | "team">("me");
  const { filters, value, setValue, activeCount, reset } = useRequestFilters();

  const query =
    scope === "me"
      ? { ...filters, query: search, assignedTo: user?.id ?? "" }
      : { ...filters, query: search, team: user?.team_id ?? "all" };

  const { data, isLoading } = useQuery({
    queryKey: ["tickets", "assigned", scope, query],
    queryFn: () => getTickets(query),
    enabled: !!user,
  });

  return (
    <AppShell title="Assigned to Me" breadcrumb="Workspace">
      <div className="mx-auto max-w-6xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Your queue</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading ? "Loading…" : `${data?.length ?? 0} request(s) in this view.`}
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          {(["me", "team"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                scope === s ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {s === "me" ? "Assigned to me" : `${user?.teamName ?? "My team"} queue`}
            </button>
          ))}
        </div>

        <RequestFilters
          value={value}
          onChange={setValue}
          activeCount={activeCount}
          onReset={() => {
            reset();
            setSearch("");
          }}
          search={search}
          onSearchChange={setSearch}
          showTeam={false}
        />

        {isLoading ? (
          <TicketTableSkeleton />
        ) : (
          <TicketTable
            tickets={data ?? []}
            onOpen={setOpenId}
            emptyTitle="Queue is clear"
            emptyBody="Nothing is waiting on you right now."
          />
        )}
      </div>

      <TicketDrawer ticketId={openId} onClose={() => setOpenId(null)} />
    </AppShell>
  );
}
