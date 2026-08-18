import { db } from "./store";
import type {
  CategoryName,
  CreateTicketInput,
  DashboardStats,
  PriorityName,
  StatusName,
  Ticket,
  TicketFilters,
  TicketView,
  User,
} from "./types";

/**
 * Single data-access layer for the whole app.
 * Today it is backed by the local demo store; swapping these
 * implementations for the PostgreSQL/API layer requires no UI changes.
 */

const delay = (ms = 180) => new Promise((r) => setTimeout(r, ms));

const byId = <T extends { id: string }>(rows: T[], id: string | null) =>
  id ? (rows.find((r) => r.id === id) ?? null) : null;

export function toView(t: Ticket): TicketView {
  const cat = byId(db.categories, t.category_id);
  const pri = byId(db.priorities, t.priority_id);
  const st = byId(db.statuses, t.status_id);
  const creator = byId(db.users, t.created_by);
  const team = byId(db.teams, t.assigned_team_id);
  const assignee = byId(db.users, t.assigned_user_id);

  const history = db.history
    .filter((h) => h.ticket_id === t.id)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((h) => ({
      id: h.id,
      from: (byId(db.statuses, h.old_status_id)?.name ?? null) as StatusName | null,
      to: (byId(db.statuses, h.new_status_id)?.name ?? "New") as StatusName,
      byName: byId(db.users, h.changed_by)?.name ?? "System",
      created_at: h.created_at,
    }));

  return {
    ...t,
    category: (cat?.name ?? "Hardware") as CategoryName,
    priority: (pri?.name ?? "Low") as PriorityName,
    status: (st?.name ?? "New") as StatusName,
    createdByName: creator?.name ?? "Unknown",
    assignedTeamName: team?.name ?? null,
    assignedUserName: assignee?.name ?? null,
    history,
  };
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
  await delay();
  return db.tickets
    .map(toView)
    .filter((v) => matches(v, filters))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export const searchTickets = (query: string) => getTickets({ query });
export const filterTickets = (filters: TicketFilters) => getTickets(filters);

export async function getTicket(idOrNumber: string): Promise<TicketView | null> {
  await delay(120);
  const t = db.tickets.find((x) => x.id === idOrNumber || x.ticket_number === idOrNumber);
  return t ? toView(t) : null;
}

export async function createTicket(
  input: CreateTicketInput,
  currentUserId: string,
): Promise<TicketView> {
  await delay(420);
  const cat = db.categories.find((c) => c.name === input.category);
  const pri = db.priorities.find((p) => p.name === input.priority);
  if (!cat || !pri) throw new Error("Unknown category or priority.");

  const stamp = new Date().toISOString();
  const number = db.nextTicketNumber();
  const ticket: Ticket = {
    id: `tkt-${number.replace("HD-", "")}-${Math.random().toString(36).slice(2, 7)}`,
    ticket_number: number,
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
  db.tickets.unshift(ticket);
  db.history.push({
    id: `hist-${ticket.id}-0`,
    ticket_id: ticket.id,
    old_status_id: null,
    new_status_id: "st-new",
    changed_by: currentUserId,
    created_at: stamp,
  });
  db.commit();
  return toView(ticket);
}

export async function updateTicket(id: string, patch: Partial<Ticket>): Promise<TicketView> {
  await delay(220);
  const t = db.tickets.find((x) => x.id === id);
  if (!t) throw new Error("Ticket not found.");
  Object.assign(t, patch, { updated_at: new Date().toISOString() });
  db.commit();
  return toView(t);
}

export async function assignTicket(
  id: string,
  data: { teamId: string | null; userId: string | null },
  currentUserId: string,
): Promise<TicketView> {
  await delay(320);
  const t = db.tickets.find((x) => x.id === id);
  if (!t) throw new Error("Ticket not found.");
  const stamp = new Date().toISOString();
  t.assigned_team_id = data.teamId;
  t.assigned_user_id = data.userId;
  t.updated_at = stamp;
  if (t.status_id === "st-new" && data.teamId) {
    db.history.push({
      id: `hist-${t.id}-${db.history.length}`,
      ticket_id: t.id,
      old_status_id: t.status_id,
      new_status_id: "st-assigned",
      changed_by: currentUserId,
      created_at: stamp,
    });
    t.status_id = "st-assigned";
  }
  db.commit();
  return toView(t);
}

export async function changeTicketStatus(
  id: string,
  status: StatusName,
  currentUserId: string,
): Promise<TicketView> {
  await delay(320);
  const t = db.tickets.find((x) => x.id === id);
  if (!t) throw new Error("Ticket not found.");
  const next = db.statuses.find((s) => s.name === status);
  if (!next) throw new Error("Unknown status.");
  if (next.id === t.status_id) return toView(t);

  const stamp = new Date().toISOString();
  db.history.push({
    id: `hist-${t.id}-${db.history.length}`,
    ticket_id: t.id,
    old_status_id: t.status_id,
    new_status_id: next.id,
    changed_by: currentUserId,
    created_at: stamp,
  });
  t.status_id = next.id;
  t.updated_at = stamp;
  t.resolved_at = next.id === "st-resolved" || next.id === "st-closed" ? stamp : null;
  t.closed_at = next.id === "st-closed" ? stamp : null;
  db.commit();
  return toView(t);
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
