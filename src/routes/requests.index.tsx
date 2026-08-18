import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/hd/AppShell";
import { TicketDrawer } from "@/components/hd/TicketDrawer";
import { TicketTable, TicketTableSkeleton } from "@/components/hd/TicketTable";
import { RequestFilters, useRequestFilters } from "@/components/hd/RequestFilters";
import { getTickets } from "@/lib/data-service";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/requests/")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search['q'] === "string" ? (search['q'] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "All requests — HelpDesk Lite" },
      {
        name: "description",
        content: "Search and filter every internal support request by status, priority and category.",
      },
      { property: "og:title", content: "All requests — HelpDesk Lite" },
      {
        property: "og:description",
        content: "Search and filter every internal support request by status, priority and category.",
      },
    ],
  }),
  component: AllRequestsPage,
});

function AllRequestsPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openId, setOpenId] = useState<string | null>(null);
  const { filters, value, setValue, activeCount, reset } = useRequestFilters();

  const query = { ...filters, query: q };
  const { data, isLoading } = useQuery({
    queryKey: ["tickets", "all", query],
    queryFn: () => getTickets(query),
    enabled: !!user,
  });

  return (
    <AppShell
      title="All Requests"
      breadcrumb="Workspace"
      search={q}
      onSearchChange={(value) => navigate({ to: "/requests", search: { q: value } })}
    >
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">All requests</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLoading ? "Loading…" : `${data?.length ?? 0} request(s) match your view.`}
            </p>
          </div>
        </div>

        <RequestFilters
          value={value}
          onChange={setValue}
          activeCount={activeCount}
          onReset={() => {
            reset();
            void navigate({ to: "/requests", search: { q: "" } });
          }}
          search={q}
          onSearchChange={(next) => void navigate({ to: "/requests", search: { q: next } })}
        />

        {isLoading ? <TicketTableSkeleton /> : <TicketTable tickets={data ?? []} onOpen={setOpenId} />}
      </div>

      <TicketDrawer ticketId={openId} onClose={() => setOpenId(null)} />
    </AppShell>
  );
}
