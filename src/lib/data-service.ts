import { supabase } from "@/integrations/supabase/client";
import { db } from "./store";
import type {
  CategoryName,
  CreateTicketInput,
  DashboardStats,
  PriorityName,
  StatusName,
  Ticket,
  TicketFilters,
  TicketStatusHistoryEntry,
  TicketView,
  User,
} from "./types";

/**
 * Single data-access layer for the whole app, backed by the Lovable Cloud
 * PostgreSQL database. Reference data (teams, categories, priorities,
 * statuses, directory) is resolved locally from identical seeded rows.
 */

const byId = <T extends { id: string }>(rows: T[], id: string | null) =>
  id ? (rows.find((r) => r.id === id) ?? null) : null;

type Row = Ticket;

function viewOf(t: Row, history: TicketStatusHistoryEntry[]): TicketView {
  const cat = byId(db.categories, t.category_id);
  const pri = byId(db.priorities, t.priority_id);
  const st = byId(db.statuses, t.status_id);
  const creator = byId(db.users, t.created_by);
  const team = byId(db.teams, t.assigned_team_id);
  const assignee = byId(db.users, t.assigned_user_id);

  return {
    ...t,
    category: (cat?.name ?? "Hardware") as CategoryName,
    priority: (pri?.name ?? "Low") as PriorityName,
    status: (st?.name ?? "New") as StatusName,
    createdByName: creator?.name ?? "Unknown",
    assignedTeamName: team?.name ?? null,
    assignedUserName: assignee?.name ?? null,
    history: history
      .filter((h) => h.ticket_id === t.id)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((h) => ({
        id: h.id,
        from: (byId(db.statuses, h.old_status_id)?.name ?? null) as StatusName | null,
        to: (byId(db.statuses, h.new_status_id)?.name ?? "New") as StatusName,
        byName: byId(db.users, h.changed_by)?.name ?? "System",
        created_at: h.created_at,
      })),
  };
}

async function fetchHistory(ticketIds: string[]): Promise<TicketStatusHistoryEntry[]> {
  if (!ticketIds.length) return [];
  const { data, error } = await supabase
    .from("ticket_status_history")
    .select("*")
    .in("ticket_id", ticketIds);
  if (error) throw new Error(error.message);
  return (data ?? []) as TicketStatusHistoryEntry[];
}

function matches(v: TicketView, f: TicketFilters) {
  if (f.query) {
    const q = f.query.trim().toLowerCase();
    const hay = `${v.ticket_number} ${v.title} ${v.description} ${v.createdByName} ${v.category} ${v.assignedTeamName ?? ""} ${v.assignedUserName ?? ""}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (f.status && f.status !== "all" && v.status !== f.status) return false;
  if (f.priority && f.priority !== "all" && v.priority !== f.priority) return false;
  if (f.category && f.category !== "all" && v.category !== f.category) return false;
  if (f.team && f.team !== "all" && v.assigned_team_id !== f.team) return false;
  if (f.createdBy && v.created_by !== f.createdBy) return false;
  if (f.assignedTo && v.assigned_user_id !== f.assignedTo) return false;
  return true;
}

export async function getTickets(filters: TicketFilters = {}): Promise<TicketView[]> {
  let q = supabase.from("tickets").select("*").order("updated_at", { ascending: false });
  if (filters.createdBy) q = q.eq("created_by", filters.createdBy);
  if (filters.assignedTo) q = q.eq("assigned_user_id", filters.assignedTo);
  if (filters.team && filters.team !== "all") q = q.eq("assigned_team_id", filters.team);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Row[];
  const history = await fetchHistory(rows.map((r) => r.id));
  return rows.map((r) => viewOf(r, history)).filter((v) => matches(v, filters));
}

export const searchTickets = (query: string) => getTickets({ query });
export const filterTickets = (filters: TicketFilters) => getTickets(filters);

export async function getTicket(idOrNumber: string): Promise<TicketView | null> {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .or(`id.eq.${idOrNumber},ticket_number.eq.${idOrNumber}`)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as Row;
  return viewOf(row, await fetchHistory([row.id]));
}

export async function createTicket(
  input: CreateTicketInput,
  currentUserId: string,
): Promise<TicketView> {
  const cat = db.categories.find((c) => c.name === input.category);
  const pri = db.priorities.find((p) => p.name === input.priority);
  if (!cat || !pri) throw new Error("Unknown category or priority.");

  const stamp = new Date().toISOString();

  // `id` and `ticket_number` are assigned by the database (sequence-backed),
  // so concurrent authors never collide.
  const payload = {
    title: input.title.trim(),
    description: input.additionalInfo?.trim()
      ? `${input.description.trim()}\n\nAdditional information: ${input.additionalInfo.trim()}`
      : input.description.trim(),
    category_id: cat.id,
    priority_id: pri.id,
    status_id: "st-new",
    created_by: currentUserId,
    assigned_team_id: null,
    assigned_user_id: null,
    created_at: stamp,
    updated_at: stamp,
    resolved_at: null,
    closed_at: null,
  };

  const { data, error } = await supabase
    .from("tickets")
    .insert(payload as never)
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  const created = data as Row;

  const { error: histError } = await supabase.from("ticket_status_history").insert({
    ticket_id: created.id,
    old_status_id: null,
    new_status_id: "st-new",
    changed_by: currentUserId,
    created_at: stamp,
  } as never);
  if (histError) throw new Error(histError.message);

  return viewOf(created, await fetchHistory([created.id]));
}

export async function updateTicket(id: string, patch: Partial<Ticket>): Promise<TicketView> {
  const { data, error } = await supabase
    .from("tickets")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const row = data as Row;
  return viewOf(row, await fetchHistory([row.id]));
}

export async function assignTicket(
  id: string,
  data: { teamId: string | null; userId: string | null },
  currentUserId: string,
): Promise<TicketView> {
  const current = await getTicket(id);
  if (!current) throw new Error("Ticket not found.");
  const stamp = new Date().toISOString();
  const becomesAssigned = current.status_id === "st-new" && !!data.teamId;

  if (becomesAssigned) {
    const { error } = await supabase.from("ticket_status_history").insert({
      id: `hist-${id}-${stamp}`,
      ticket_id: id,
      old_status_id: current.status_id,
      new_status_id: "st-assigned",
      changed_by: currentUserId,
      created_at: stamp,
    });
    if (error) throw new Error(error.message);
  }

  return updateTicket(id, {
    assigned_team_id: data.teamId,
    assigned_user_id: data.userId,
    ...(becomesAssigned ? { status_id: "st-assigned" } : {}),
  });
}

export async function changeTicketStatus(
  id: string,
  status: StatusName,
  currentUserId: string,
): Promise<TicketView> {
  const current = await getTicket(id);
  if (!current) throw new Error("Ticket not found.");
  const next = db.statuses.find((s) => s.name === status);
  if (!next) throw new Error("Unknown status.");
  if (next.id === current.status_id) return current;

  const stamp = new Date().toISOString();
  const { error } = await supabase.from("ticket_status_history").insert({
    id: `hist-${id}-${stamp}`,
    ticket_id: id,
    old_status_id: current.status_id,
    new_status_id: next.id,
    changed_by: currentUserId,
    created_at: stamp,
  });
  if (error) throw new Error(error.message);

  return updateTicket(id, {
    status_id: next.id,
    resolved_at: next.id === "st-resolved" || next.id === "st-closed" ? stamp : null,
    closed_at: next.id === "st-closed" ? stamp : null,
  });
}

export async function getDashboardStats(filters: TicketFilters = {}): Promise<DashboardStats> {
  const list = await getTickets(filters);

  const byStatus: Record<StatusName, number> = {
    New: 0,
    Assigned: 0,
    "In Progress": 0,
    Resolved: 0,
    Closed: 0,
  };
  const byPriority: Record<PriorityName, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  const catMap = new Map<string, number>();

  for (const t of list) {
    byStatus[t.status] += 1;
    byPriority[t.priority] += 1;
    catMap.set(t.category, (catMap.get(t.category) ?? 0) + 1);
  }

  const openStatuses: StatusName[] = ["New", "Assigned", "In Progress"];
  const teamWorkload = db.teams.map((team) => {
    const rows = list.filter((t) => t.assigned_team_id === team.id);
    return {
      name: team.name,
      open: rows.filter((t) => openStatuses.includes(t.status)).length,
      total: rows.length,
    };
  });

  return {
    total: list.length,
    byStatus,
    byPriority,
    byCategory: [...catMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    teamWorkload: teamWorkload.sort((a, b) => b.total - a.total),
    open: byStatus.New + byStatus.Assigned + byStatus["In Progress"],
    resolved: byStatus.Resolved,
    closed: byStatus.Closed,
    needsAttention: list.filter(
      (t) => openStatuses.includes(t.status) && (t.priority === "High" || t.priority === "Critical"),
    ).length,
  };
}

export const getTeams = () => db.teams;
export const getCategories = () => db.categories;
export const getPriorities = () => db.priorities;
export const getStatuses = () => db.statuses;
export const getUsers = (): User[] => db.users;
export const getTeamMembers = (teamId: string | null) =>
  teamId ? db.users.filter((u) => u.team_id === teamId) : db.users.filter((u) => u.team_id);
