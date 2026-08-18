export type RoleName =
  | "Employee"
  | "Support Staff"
  | "Manager"
  | "Product Operations"
  | "Engineer";

export type StatusName = "New" | "Assigned" | "In Progress" | "Resolved" | "Closed";
export type PriorityName = "Low" | "Medium" | "High" | "Critical";
export type CategoryName =
  | "Hardware"
  | "Software"
  | "Network"
  | "Access & Accounts"
  | "Infrastructure"
  | "Business Request";

export interface Role {
  id: string;
  name: RoleName;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: CategoryName;
  description: string;
  is_active: boolean;
}

export interface Priority {
  id: string;
  name: PriorityName;
  level: number;
  description: string;
  is_active: boolean;
}

export interface Status {
  id: string;
  name: StatusName;
  order: number;
  description: string;
  is_active: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role_id: string;
  team_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketStatusHistoryEntry {
  id: string;
  ticket_id: string;
  old_status_id: string | null;
  new_status_id: string;
  changed_by: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category_id: string;
  priority_id: string;
  status_id: string;
  created_by: string;
  assigned_team_id: string | null;
  assigned_user_id: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
}

/** Denormalised shape the UI renders. Mirrors the eventual API response. */
export interface TicketView extends Ticket {
  category: CategoryName;
  priority: PriorityName;
  status: StatusName;
  createdByName: string;
  assignedTeamName: string | null;
  assignedUserName: string | null;
  history: Array<{
    id: string;
    from: StatusName | null;
    to: StatusName;
    byName: string;
    created_at: string;
  }>;
}

export interface TicketFilters {
  query?: string;
  status?: StatusName | "all";
  priority?: PriorityName | "all";
  category?: CategoryName | "all";
  team?: string | "all";
  createdBy?: string;
  assignedTo?: string;
}

export interface DashboardStats {
  total: number;
  byStatus: Record<StatusName, number>;
  byPriority: Record<PriorityName, number>;
  byCategory: Array<{ name: string; count: number }>;
  teamWorkload: Array<{ name: string; open: number; total: number }>;
  open: number;
  resolved: number;
  closed: number;
  needsAttention: number;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  category: CategoryName;
  priority: PriorityName;
  additionalInfo?: string;
}
