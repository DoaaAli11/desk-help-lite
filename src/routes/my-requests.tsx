import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/hd/AppShell";
import { TicketDrawer } from "@/components/hd/TicketDrawer";
import { TicketTable, TicketTableSkeleton } from "@/components/hd/TicketTable";
import { RequestFilters, useRequestFilters } from "@/components/hd/RequestFilters";
import { getTickets } from "@/lib/data-service";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/my-requests")({
  head: () => ({
    meta: [
      { title: "My requests — HelpDesk Lite" },
      { name: "description", content: "Track the status of every request you have submitted." },
      { property: "og:title", content: "My requests — HelpDesk Lite" },
      {
        property: "og:description",
        content: "Track the status of every request you have submitted.",
      },
    ],
  }),
  component: MyRequestsPage,
});

function MyRequestsPage() {
  const { user } = useAuth();
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { filters, value, setValue, activeCount, reset } = useRequestFilters();

  const query = { ...filters, query: search, createdBy: user?.id ?? "" };
  const { data, isLoading } = useQuery({
    queryKey: ["tickets", "mine", query],
    queryFn: () => getTickets(query),
    enabled: !!user,
  });

  return (
    <AppShell title="My Requests" breadcrumb="Workspace">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">My requests</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLoading ? "Loading…" : `${data?.length ?? 0} request(s) submitted by you.`}
            </p>
          </div>
          <Link
            to="/requests/new"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            New request
          </Link>
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
            emptyTitle="You haven't submitted anything yet"
            emptyBody="Create your first request and it will show up here."
          />
        )}
      </div>

      <TicketDrawer ticketId={openId} onClose={() => setOpenId(null)} />
    </AppShell>
  );
}
