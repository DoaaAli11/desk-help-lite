import { categories, priorities, roles, statuses, teams, users } from "./demo-data";

/**
 * Static reference data (roles, teams, categories, priorities, statuses and the
 * staff directory). These rows are also stored in the database and share the
 * same identifiers, so the UI can resolve labels without an extra round-trip.
 */
export const db = {
  roles,
  teams,
  categories,
  priorities,
  statuses,
  users,
};
