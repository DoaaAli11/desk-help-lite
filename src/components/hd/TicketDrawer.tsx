import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  assignTicket,
  changeTicketStatus,
  getTeamMembers,
  getTeams,
  getTicket,
} from "@/lib/data-service";
import { capabilitiesFor, useAuth } from "@/lib/auth";
import type { StatusName } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PriorityBadge, StatusBadge, fullDate, relativeTime } from "./indicators";

const steps: StatusName[] = ["New", "Assigned", "In Progress", "Resolved"];
const stepLabels = ["Submitted", "Assigned", "In Progress", "Resolved"];
const allStatuses: StatusName[] = ["New", "Assigned", "In Progress", "Resolved", "Closed"];

export function TicketDrawer({ ticketId, onClose }: { ticketId: string | null; onClose: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [panel, setPanel] = useState<"none" | "assign" | "status">("none");
  const [teamId, setTeamId] = useState<string>("");
  const [assigneeId, setAssigneeId] = useState<string>("");

  const { data: ticket, isLoading } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => getTicket(ticketId!),
    enabled: !!ticketId,
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["tickets"] });
    void qc.invalidateQueries({ queryKey: ["stats"] });
    void qc.invalidateQueries({ queryKey: ["ticket", ticketId] });
  };

  const assignMutation = useMutation({
    mutationFn: () =>
      assignTicket(ticket!.id, { teamId: teamId || null, userId: assigneeId || null }, user!.id),
    onSuccess: (t) => {
      invalidate();
      setPanel("none");
      toast.success(`${t.ticket_number} assigned to ${t.assignedTeamName ?? "Unassigned"}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusMutation = useMutation({
    mutationFn: (status: StatusName) => changeTicketStatus(ticket!.id, status, user!.id),
    onSuccess: (t) => {
      invalidate();
      setPanel("none");
      toast.success(`${t.ticket_number} moved to ${t.status}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!ticketId || !user) return null;
  const caps = capabilitiesFor(user.role);
  const currentStep = ticket ? steps.indexOf(ticket.status) : -1;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Close details" className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-xl flex-col bg-card shadow-drawer">
        {isLoading || !ticket ? (
          <div className="space-y-4 p-6">
            <div className="h-6 w-40 animate-pulse rounded bg-muted" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-32 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <>
            <header className="border-b border-border px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <span className="ticket-id">{ticket.ticket_number}</span>
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </div>
                <button onClick={onClose} aria-label="Close" className="text-muted-foreground">
                  <X className="size-5" />
                </button>
              </div>
              <h2 className="mt-2 text-lg font-bold">{ticket.title}</h2>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <section>
                <p className="label-caps">Workflow progress</p>
                <ol className="mt-3 flex items-center">
                  {steps.map((s, i) => {
                    const done = currentStep > i || ticket.status === "Closed";
                    const active = currentStep === i;
                    return (
                      <li key={s} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center gap-1.5">
                          <span
                            className={cn(
                              "flex size-7 items-center justify-center rounded-full text-xs font-bold",
                              done || active
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {done ? "✓" : i + 1}
                          </span>
                          <span
                            className={cn(
                              "text-[11px] font-medium",
                              active ? "text-foreground" : "text-muted-foreground",
                            )}
                          >
                            {stepLabels[i]}
                          </span>
                        </div>
                        {i < steps.length - 1 ? (
                          <span
                            className={cn(
                              "mx-2 -mt-5 h-0.5 flex-1",
                              done ? "bg-primary" : "bg-border",
                            )}
                          />
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              </section>

              <section>
                <p className="label-caps">Description</p>
                <p className="mt-2 rounded-xl bg-secondary p-4 text-sm leading-relaxed whitespace-pre-line">
                  {ticket.description}
                </p>
              </section>

              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Category" value={ticket.category} />
                <Field label="Submitted by" value={ticket.createdByName} />
                <Field label="Created" value={fullDate(ticket.created_at)} />
                <Field label="Last updated" value={relativeTime(ticket.updated_at)} />
                <Field label="Assigned team" value={ticket.assignedTeamName ?? "Unassigned"} />
                <Field label="Assigned to" value={ticket.assignedUserName ?? "—"} />
              </dl>

              <section>
                <p className="label-caps">Status history</p>
                <ul className="mt-2 space-y-2">
                  {ticket.history.map((h) => (
                    <li key={h.id} className="flex items-center gap-2 text-sm">
                      <span className="size-1.5 rounded-full bg-primary" />
                      <span className="text-muted-foreground">
                        {h.from ? `${h.from} → ` : "Submitted as "}
                      </span>
                      <span className="font-medium">{h.to}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {h.byName} · {relativeTime(h.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {panel === "assign" ? (
                <section className="surface-card space-y-3 p-4">
                  <p className="text-sm font-semibold">Assign request</p>
                  <label className="block text-sm">
                    <span className="label-caps">Team</span>
                    <select
                      value={teamId}
                      onChange={(e) => {
                        setTeamId(e.target.value);
                        setAssigneeId("");
                      }}
                      className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                    >
                      <option value="">Unassigned</option>
                      {getTeams().map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className="label-caps">Assignee</span>
                    <select
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                    >
                      <option value="">Nobody yet</option>
                      {getTeamMembers(teamId || null).map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex justify-end gap-2">
                    <GhostButton onClick={() => setPanel("none")}>Cancel</GhostButton>
                    <PrimaryButton
                      loading={assignMutation.isPending}
                      onClick={() => assignMutation.mutate()}
                    >
                      Confirm assignment
                    </PrimaryButton>
                  </div>
                </section>
              ) : null}

              {panel === "status" ? (
                <section className="surface-card space-y-3 p-4">
                  <p className="text-sm font-semibold">Change status</p>
                  <div className="flex flex-wrap gap-2">
                    {allStatuses.map((s) => (
                      <button
                        key={s}
                        disabled={statusMutation.isPending || s === ticket.status}
                        onClick={() => statusMutation.mutate(s)}
                        className={cn(
                          "rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors",
                          s === ticket.status
                            ? "cursor-not-allowed bg-muted text-muted-foreground"
                            : "hover:border-primary hover:text-primary",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <GhostButton onClick={() => setPanel("none")}>Cancel</GhostButton>
                  </div>
                </section>
              ) : null}
            </div>

            {caps.canAssign || caps.canChangeStatus ? (
              <footer className="flex gap-3 border-t border-border px-6 py-4">
                {caps.canAssign ? (
                  <GhostButton
                    className="flex-1"
                    onClick={() => {
                      setTeamId(ticket.assigned_team_id ?? "");
                      setAssigneeId(ticket.assigned_user_id ?? "");
                      setPanel("assign");
                    }}
                  >
                    Assign
                  </GhostButton>
                ) : null}
                {caps.canChangeStatus ? (
                  <PrimaryButton className="flex-1" onClick={() => setPanel("status")}>
                    Change Status
                  </PrimaryButton>
                ) : null}
              </footer>
            ) : (
              <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
                You have view-only access to this request.
              </footer>
            )}
          </>
        )}
      </aside>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <dt className="label-caps">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}

export function PrimaryButton({
  children,
  className,
  loading,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60",
        className,
      )}
    >
      {loading ? <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary",
        className,
      )}
    >
      {children}
    </button>
  );
}
