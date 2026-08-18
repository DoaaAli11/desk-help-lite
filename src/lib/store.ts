import {
  buildSeedTickets,
  categories,
  priorities,
  roles,
  statuses,
  teams,
  users,
} from "./demo-data";
import type { Ticket, TicketStatusHistoryEntry } from "./types";

const STORAGE_KEY = "helpdesk-lite:v1";

interface StoreShape {
  tickets: Ticket[];
  history: TicketStatusHistoryEntry[];
  nextNumber: number;
}

function seed(): StoreShape {
  const { tickets, history } = buildSeedTickets();
  return { tickets, history, nextNumber: 1026 };
}

let store: StoreShape | null = null;

function load(): StoreShape {
  if (store) return store;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoreShape;
        if (parsed?.tickets?.length) {
          store = parsed;
          return store;
        }
      }
    } catch {
      /* fall through to a fresh seed */
    }
  }
  store = seed();
  persist();
  return store;
}

function persist() {
  if (typeof window === "undefined" || !store) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* storage unavailable — stay in memory */
  }
}

export const db = {
  get tickets() {
    return load().tickets;
  },
  get history() {
    return load().history;
  },
  nextTicketNumber() {
    const s = load();
    const n = s.nextNumber++;
    persist();
    return `HD-${n}`;
  },
  commit() {
    persist();
  },
  reset() {
    store = seed();
    persist();
  },
  roles,
  teams,
  categories,
  priorities,
  statuses,
  users,
};
