import type {
  Category,
  Priority,
  Role,
  Status,
  Team,
  Ticket,
  TicketStatusHistoryEntry,
  User,
} from "./types";

export const roles: Role[] = [
  { id: "role-employee", name: "Employee" },
  { id: "role-support", name: "Support Staff" },
  { id: "role-manager", name: "Manager" },
  { id: "role-operations", name: "Product Operations" },
  { id: "role-engineer", name: "Engineer" },
];

export const teams: Team[] = [
  { id: "team-it", name: "IT Support", description: "First-line workplace support", is_active: true },
  {
    id: "team-infra",
    name: "Infrastructure",
    description: "Servers, VPN and core platform",
    is_active: true,
  },
  {
    id: "team-software",
    name: "Software Support",
    description: "Business applications and licensing",
    is_active: true,
  },
  {
    id: "team-network",
    name: "Network Operations",
    description: "Connectivity, Wi-Fi and firewalls",
    is_active: true,
  },
  {
    id: "team-business",
    name: "Business Operations",
    description: "Process, access approvals and requests",
    is_active: true,
  },
];

export const categories: Category[] = [
  { id: "cat-hardware", name: "Hardware", description: "Laptops, peripherals, devices", is_active: true },
  { id: "cat-software", name: "Software", description: "Applications and licences", is_active: true },
  { id: "cat-network", name: "Network", description: "Wi-Fi, VPN and connectivity", is_active: true },
  {
    id: "cat-access",
    name: "Access & Accounts",
    description: "Permissions, folders and accounts",
    is_active: true,
  },
  {
    id: "cat-infra",
    name: "Infrastructure",
    description: "Servers, environments and deployments",
    is_active: true,
  },
  {
    id: "cat-business",
    name: "Business Request",
    description: "Procurement and business process requests",
    is_active: true,
  },
];

export const priorities: Priority[] = [
  { id: "pri-low", name: "Low", level: 1, description: "No immediate impact", is_active: true },
  { id: "pri-medium", name: "Medium", level: 2, description: "Some disruption, can wait", is_active: true },
  { id: "pri-high", name: "High", level: 3, description: "Significant impact on work", is_active: true },
  { id: "pri-critical", name: "Critical", level: 4, description: "Complete blocker, urgent", is_active: true },
];

export const statuses: Status[] = [
  { id: "st-new", name: "New", order: 1, description: "Submitted, awaiting triage", is_active: true },
  { id: "st-assigned", name: "Assigned", order: 2, description: "Routed to a team", is_active: true },
  { id: "st-progress", name: "In Progress", order: 3, description: "Being worked on", is_active: true },
  { id: "st-resolved", name: "Resolved", order: 4, description: "Fix delivered", is_active: true },
  { id: "st-closed", name: "Closed", order: 5, description: "Confirmed and closed", is_active: true },
];

const now = Date.now();
const H = 60 * 60 * 1000;
const ago = (hours: number) => new Date(now - hours * H).toISOString();

export const users: User[] = [
  {
    id: "usr-ahmed",
    name: "Ahmed Hassan",
    email: "employee@helpdesk.demo",
    role_id: "role-employee",
    team_id: null,
    created_at: ago(2000),
    updated_at: ago(2000),
  },
  {
    id: "usr-sara",
    name: "Sara Mohamed",
    email: "sara.mohamed@helpdesk.demo",
    role_id: "role-employee",
    team_id: null,
    created_at: ago(1900),
    updated_at: ago(1900),
  },
  {
    id: "usr-omar",
    name: "Omar Khaled",
    email: "support@helpdesk.demo",
    role_id: "role-support",
    team_id: "team-it",
    created_at: ago(1800),
    updated_at: ago(1800),
  },
  {
    id: "usr-mariam",
    name: "Mariam Adel",
    email: "mariam.adel@helpdesk.demo",
    role_id: "role-support",
    team_id: "team-it",
    created_at: ago(1700),
    updated_at: ago(1700),
  },
  {
    id: "usr-youssef",
    name: "Youssef Ali",
    email: "manager@helpdesk.demo",
    role_id: "role-manager",
    team_id: "team-business",
    created_at: ago(1600),
    updated_at: ago(1600),
  },
  {
    id: "usr-nour",
    name: "Nour Ahmed",
    email: "operations@helpdesk.demo",
    role_id: "role-operations",
    team_id: "team-business",
    created_at: ago(1500),
    updated_at: ago(1500),
  },
  {
    id: "usr-karim",
    name: "Karim Samir",
    email: "engineer@helpdesk.demo",
    role_id: "role-engineer",
    team_id: "team-infra",
    created_at: ago(1400),
    updated_at: ago(1400),
  },
];

interface Seed {
  n: number;
  title: string;
  description: string;
  category_id: string;
  priority_id: string;
  status_id: string;
  created_by: string;
  assigned_team_id: string | null;
  assigned_user_id: string | null;
  hoursAgo: number;
  updatedHoursAgo: number;
}

const seeds: Seed[] = [
  {
    n: 1001,
    title: "Laptop cannot connect to company Wi-Fi",
    description:
      "My laptop stopped joining the CORP-WIFI network this morning. It authenticates for a few seconds then drops back to 'No internet'. Other devices on the same desk connect fine.",
    category_id: "cat-network",
    priority_id: "pri-high",
    status_id: "st-progress",
    created_by: "usr-ahmed",
    assigned_team_id: "team-network",
    assigned_user_id: "usr-omar",
    hoursAgo: 6,
    updatedHoursAgo: 1,
  },
  {
    n: 1002,
    title: "Request access to Finance shared folder",
    description:
      "I need read access to the Finance 2026 shared folder to prepare the quarterly cost report. Approval from Youssef Ali is already in place.",
    category_id: "cat-access",
    priority_id: "pri-medium",
    status_id: "st-assigned",
    created_by: "usr-sara",
    assigned_team_id: "team-it",
    assigned_user_id: "usr-mariam",
    hoursAgo: 9,
    updatedHoursAgo: 3,
  },
  {
    n: 1003,
    title: "Microsoft Excel crashes when opening large files",
    description:
      "Excel closes without warning when I open the consolidated budget workbook (about 40MB). Smaller files open normally. Repairing Office did not help.",
    category_id: "cat-software",
    priority_id: "pri-medium",
    status_id: "st-new",
    created_by: "usr-ahmed",
    assigned_team_id: null,
    assigned_user_id: null,
    hoursAgo: 4,
    updatedHoursAgo: 4,
  },
  {
    n: 1004,
    title: "Replace damaged keyboard",
    description:
      "The spacebar and three letter keys on my desk keyboard no longer register. Requesting a replacement from the spare stock.",
    category_id: "cat-hardware",
    priority_id: "pri-low",
    status_id: "st-resolved",
    created_by: "usr-sara",
    assigned_team_id: "team-it",
    assigned_user_id: "usr-omar",
    hoursAgo: 52,
    updatedHoursAgo: 20,
  },
  {
    n: 1005,
    title: "VPN connection unavailable",
    description:
      "The VPN client fails with 'gateway unreachable' from home. Nobody on my team can connect, so remote work is fully blocked.",
    category_id: "cat-network",
    priority_id: "pri-critical",
    status_id: "st-progress",
    created_by: "usr-ahmed",
    assigned_team_id: "team-infra",
    assigned_user_id: "usr-karim",
    hoursAgo: 3,
    updatedHoursAgo: 0.5,
  },
  {
    n: 1006,
    title: "New starter setup for Layla Fouad",
    description:
      "Layla joins Business Operations on Monday and needs a laptop, email account, and access to the shared drive and time-tracking tool.",
    category_id: "cat-access",
    priority_id: "pri-high",
    status_id: "st-assigned",
    created_by: "usr-nour",
    assigned_team_id: "team-it",
    assigned_user_id: "usr-mariam",
    hoursAgo: 26,
    updatedHoursAgo: 5,
  },
  {
    n: 1007,
    title: "Office printer on 2nd floor jams on every job",
    description:
      "The shared printer jams in tray 2 for any document longer than two pages. The paper path has already been cleared twice today.",
    category_id: "cat-hardware",
    priority_id: "pri-medium",
    status_id: "st-assigned",
    created_by: "usr-sara",
    assigned_team_id: "team-it",
    assigned_user_id: "usr-omar",
    hoursAgo: 20,
    updatedHoursAgo: 8,
  },
  {
    n: 1008,
    title: "Production deployment failing on release pipeline",
    description:
      "The release job fails at the migration step with a database connection timeout. Last successful deployment was yesterday evening.",
    category_id: "cat-infra",
    priority_id: "pri-critical",
    status_id: "st-progress",
    created_by: "usr-karim",
    assigned_team_id: "team-infra",
    assigned_user_id: "usr-karim",
    hoursAgo: 7,
    updatedHoursAgo: 0.3,
  },
  {
    n: 1009,
    title: "CRM licence renewal for the sales team",
    description:
      "Twelve CRM seats expire at the end of the month. Requesting renewal approval and procurement before the cut-off date.",
    category_id: "cat-business",
    priority_id: "pri-medium",
    status_id: "st-new",
    created_by: "usr-youssef",
    assigned_team_id: null,
    assigned_user_id: null,
    hoursAgo: 11,
    updatedHoursAgo: 11,
  },
  {
    n: 1010,
    title: "Shared mailbox not syncing on Outlook",
    description:
      "The support@ shared mailbox shows messages from two days ago only. Removing and re-adding the account did not restore syncing.",
    category_id: "cat-software",
    priority_id: "pri-high",
    status_id: "st-progress",
    created_by: "usr-mariam",
    assigned_team_id: "team-software",
    assigned_user_id: "usr-mariam",
    hoursAgo: 30,
    updatedHoursAgo: 2,
  },
  {
    n: 1011,
    title: "Monitor flickers when docked",
    description:
      "The external monitor flickers roughly every 30 seconds when connected through the dock. Direct HDMI connection is stable.",
    category_id: "cat-hardware",
    priority_id: "pri-low",
    status_id: "st-new",
    created_by: "usr-sara",
    assigned_team_id: null,
    assigned_user_id: null,
    hoursAgo: 14,
    updatedHoursAgo: 14,
  },
  {
    n: 1012,
    title: "Guest Wi-Fi network unavailable in meeting rooms",
    description:
      "Visitors cannot join GUEST-WIFI in meeting rooms 3 and 4. The SSID is visible but authentication times out.",
    category_id: "cat-network",
    priority_id: "pri-medium",
    status_id: "st-assigned",
    created_by: "usr-nour",
    assigned_team_id: "team-network",
    assigned_user_id: "usr-omar",
    hoursAgo: 22,
    updatedHoursAgo: 6,
  },
  {
    n: 1013,
    title: "Password reset for ERP account",
    description:
      "My ERP account locked after several failed sign-in attempts. Requesting an unlock and password reset.",
    category_id: "cat-access",
    priority_id: "pri-high",
    status_id: "st-resolved",
    created_by: "usr-ahmed",
    assigned_team_id: "team-it",
    assigned_user_id: "usr-mariam",
    hoursAgo: 46,
    updatedHoursAgo: 40,
  },
  {
    n: 1014,
    title: "Staging environment out of disk space",
    description:
      "The staging server is at 98% disk usage and build artefacts can no longer be written. Old artefacts need pruning and a retention policy.",
    category_id: "cat-infra",
    priority_id: "pri-high",
    status_id: "st-assigned",
    created_by: "usr-karim",
    assigned_team_id: "team-infra",
    assigned_user_id: "usr-karim",
    hoursAgo: 17,
    updatedHoursAgo: 9,
  },
  {
    n: 1015,
    title: "Design tool licence expired",
    description:
      "The design suite reports an expired licence for four team members, blocking work on the campaign assets due this week.",
    category_id: "cat-software",
    priority_id: "pri-high",
    status_id: "st-assigned",
    created_by: "usr-nour",
    assigned_team_id: "team-software",
    assigned_user_id: "usr-mariam",
    hoursAgo: 5,
    updatedHoursAgo: 2.5,
  },
  {
    n: 1016,
    title: "Request a second monitor for hybrid desk",
    description:
      "I work from desk B14 three days a week and would like a second monitor to match my home setup.",
    category_id: "cat-hardware",
    priority_id: "pri-low",
    status_id: "st-new",
    created_by: "usr-sara",
    assigned_team_id: null,
    assigned_user_id: null,
    hoursAgo: 33,
    updatedHoursAgo: 33,
  },
  {
    n: 1017,
    title: "Email delivery delayed to external domains",
    description:
      "Messages to external recipients arrive 20 to 40 minutes late. Internal delivery is immediate. Started after yesterday's mail gateway change.",
    category_id: "cat-infra",
    priority_id: "pri-critical",
    status_id: "st-progress",
    created_by: "usr-youssef",
    assigned_team_id: "team-infra",
    assigned_user_id: "usr-karim",
    hoursAgo: 12,
    updatedHoursAgo: 1.5,
  },
  {
    n: 1018,
    title: "Onboarding checklist automation for new hires",
    description:
      "Requesting an automated checklist so account, hardware and access steps are created together whenever a new hire is registered.",
    category_id: "cat-business",
    priority_id: "pri-low",
    status_id: "st-closed",
    created_by: "usr-nour",
    assigned_team_id: "team-business",
    assigned_user_id: "usr-nour",
    hoursAgo: 120,
    updatedHoursAgo: 70,
  },
  {
    n: 1019,
    title: "Firewall rule needed for supplier portal",
    description:
      "Procurement cannot reach the supplier portal from the office network. A firewall rule allowing outbound HTTPS to the portal range is required.",
    category_id: "cat-network",
    priority_id: "pri-medium",
    status_id: "st-progress",
    created_by: "usr-youssef",
    assigned_team_id: "team-network",
    assigned_user_id: "usr-omar",
    hoursAgo: 28,
    updatedHoursAgo: 4,
  },
  {
    n: 1020,
    title: "Docking station not charging laptop",
    description:
      "The dock passes video through but no longer charges the laptop. Swapping the power brick made no difference.",
    category_id: "cat-hardware",
    priority_id: "pri-medium",
    status_id: "st-resolved",
    created_by: "usr-ahmed",
    assigned_team_id: "team-it",
    assigned_user_id: "usr-omar",
    hoursAgo: 60,
    updatedHoursAgo: 44,
  },
  {
    n: 1021,
    title: "Access request for reporting dashboard",
    description:
      "Requesting viewer access to the operations reporting dashboard to track weekly request volumes.",
    category_id: "cat-access",
    priority_id: "pri-low",
    status_id: "st-closed",
    created_by: "usr-sara",
    assigned_team_id: "team-business",
    assigned_user_id: "usr-nour",
    hoursAgo: 96,
    updatedHoursAgo: 80,
  },
  {
    n: 1022,
    title: "Slow file server response in the morning",
    description:
      "Opening documents from the file server takes 30 seconds or more between 9am and 10am, then performance returns to normal.",
    category_id: "cat-infra",
    priority_id: "pri-medium",
    status_id: "st-new",
    created_by: "usr-mariam",
    assigned_team_id: null,
    assigned_user_id: null,
    hoursAgo: 2,
    updatedHoursAgo: 2,
  },
  {
    n: 1023,
    title: "Purchase request for ergonomic chairs",
    description:
      "Requesting three ergonomic chairs for the support desk following the workplace assessment recommendations.",
    category_id: "cat-business",
    priority_id: "pri-low",
    status_id: "st-assigned",
    created_by: "usr-omar",
    assigned_team_id: "team-business",
    assigned_user_id: "usr-nour",
    hoursAgo: 40,
    updatedHoursAgo: 24,
  },
  {
    n: 1024,
    title: "Two-factor authentication app not accepting codes",
    description:
      "The authenticator app generates codes that the sign-in page rejects. Device clock is synchronised and the account was working yesterday.",
    category_id: "cat-access",
    priority_id: "pri-critical",
    status_id: "st-assigned",
    created_by: "usr-sara",
    assigned_team_id: "team-it",
    assigned_user_id: "usr-mariam",
    hoursAgo: 1.5,
    updatedHoursAgo: 1,
  },
  {
    n: 1025,
    title: "Reporting service returns 500 errors after upgrade",
    description:
      "Since the reporting service upgrade, scheduled exports fail with HTTP 500. Manual exports of small ranges still work.",
    category_id: "cat-software",
    priority_id: "pri-high",
    status_id: "st-resolved",
    created_by: "usr-karim",
    assigned_team_id: "team-software",
    assigned_user_id: "usr-mariam",
    hoursAgo: 72,
    updatedHoursAgo: 30,
  },
];

const statusOrder = ["st-new", "st-assigned", "st-progress", "st-resolved", "st-closed"];

export function buildSeedTickets(): {
  tickets: Ticket[];
  history: TicketStatusHistoryEntry[];
} {
  const tickets: Ticket[] = [];
  const history: TicketStatusHistoryEntry[] = [];

  for (const s of seeds) {
    const created = ago(s.hoursAgo);
    const updated = ago(s.updatedHoursAgo);
    const isResolved = s.status_id === "st-resolved" || s.status_id === "st-closed";
    tickets.push({
      id: `tkt-${s.n}`,
      ticket_number: `HD-${s.n}`,
      title: s.title,
      description: s.description,
      category_id: s.category_id,
      priority_id: s.priority_id,
      status_id: s.status_id,
      created_by: s.created_by,
      assigned_team_id: s.assigned_team_id,
      assigned_user_id: s.assigned_user_id,
      created_at: created,
      updated_at: updated,
      resolved_at: isResolved ? updated : null,
      closed_at: s.status_id === "st-closed" ? updated : null,
    });

    const targetIndex = statusOrder.indexOf(s.status_id);
    const span = s.hoursAgo - s.updatedHoursAgo;
    for (let i = 0; i <= targetIndex; i++) {
      const at = ago(s.hoursAgo - (span * i) / Math.max(targetIndex, 1));
      history.push({
        id: `hist-${s.n}-${i}`,
        ticket_id: `tkt-${s.n}`,
        old_status_id: i === 0 ? null : statusOrder[i - 1]!,
        new_status_id: statusOrder[i]!,
        changed_by: i === 0 ? s.created_by : (s.assigned_user_id ?? s.created_by),
        created_at: at,
      });
    }
  }

  return { tickets, history };
}
