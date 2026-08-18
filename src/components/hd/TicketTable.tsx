import type { TicketView } from "@/lib/types";
import { PriorityBadge, StatusBadge, relativeTime } from "./indicators";

export function TicketTable({
  tickets,
  onOpen,
  emptyTitle = "No requests found",
  emptyBody = "Try adjusting your search or filters.",
}: {
  tickets: TicketView[];
  onOpen: (id: string) => void;
  emptyTitle?: string;
  emptyBody?: string;
}) {
  if (tickets.length === 0) {
    return (
      <div className="surface-card px-6 py-16 text-center">
        <p className="text-sm font-semibold">{emptyTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{emptyBody}</p>
      </div>
    );
  }

  return (
    <div className="surface-card overflow-hidden">
      {/* Desktop table */}
      <table className="hidden w-full text-left md:table">
        <thead>
          <tr className="border-b border-border">
            {["ID", "Title", "Category", "Priority", "Status", "Assigned Team", "Assigned To", "Updated"].map(
              (h) => (
                <th key={h} className="label-caps px-4 py-3">
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr
              key={t.id}
              onClick={() => onOpen(t.id)}
              className="cursor-pointer border-b border-border last:border-0 hover:bg-secondary"
            >
              <td className="px-4 py-3 align-top">
                <span className="ticket-id">{t.ticket_number}</span>
              </td>
              <td className="max-w-xs px-4 py-3 align-top">
                <p className="truncate text-sm font-medium">{t.title}</p>
                <p className="truncate text-xs text-muted-foreground">{t.createdByName}</p>
              </td>
              <td className="px-4 py-3 align-top text-sm text-muted-foreground">{t.category}</td>
              <td className="px-4 py-3 align-top">
                <PriorityBadge priority={t.priority} />
              </td>
              <td className="px-4 py-3 align-top">
                <StatusBadge status={t.status} />
              </td>
              <td className="px-4 py-3 align-top text-sm">{t.assignedTeamName ?? "—"}</td>
              <td className="px-4 py-3 align-top text-sm">{t.assignedUserName ?? "—"}</td>
              <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                {relativeTime(t.updated_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <ul className="divide-y divide-border md:hidden">
        {tickets.map((t) => (
          <li key={t.id}>
            <button
              onClick={() => onOpen(t.id)}
              className="w-full px-4 py-4 text-left transition-colors hover:bg-secondary"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="ticket-id">{t.ticket_number}</span>
                <span className="text-xs text-muted-foreground">{relativeTime(t.updated_at)}</span>
              </div>
              <p className="mt-1 text-sm font-medium">{t.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <PriorityBadge priority={t.priority} />
                <StatusBadge status={t.status} />
                <span className="text-xs text-muted-foreground">{t.category}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {t.assignedTeamName ?? "Unassigned"}
                {t.assignedUserName ? ` · ${t.assignedUserName}` : ""}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TicketTableSkeleton() {
  return (
    <div className="surface-card divide-y divide-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}
