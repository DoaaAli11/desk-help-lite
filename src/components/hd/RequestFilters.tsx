import { useState } from "react";
import { Search, X } from "lucide-react";
import { getCategories, getPriorities, getStatuses, getTeams } from "@/lib/data-service";
import type { TicketFilters } from "@/lib/types";

export type FilterValue = {
  status: string;
  priority: string;
  category: string;
  team: string;
};

const empty: FilterValue = { status: "all", priority: "all", category: "all", team: "all" };

export function useRequestFilters() {
  const [value, setValue] = useState<FilterValue>(empty);
  const activeCount = Object.values(value).filter((v) => v !== "all").length;
  const filters = {
    status: value.status,
    priority: value.priority,
    category: value.category,
    team: value.team,
  } as TicketFilters;
  return {
    value,
    setValue,
    filters,
    activeCount,
    reset: () => setValue(empty),
  };
}

export function RequestFilters({
  value,
  onChange,
  onReset,
  activeCount,
  search,
  onSearchChange,
  showTeam = true,
}: {
  value: FilterValue;
  onChange: (next: FilterValue) => void;
  onReset: () => void;
  activeCount: number;
  search: string;
  onSearchChange: (v: string) => void;
  showTeam?: boolean;
}) {
  const set = (key: keyof FilterValue) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    onChange({ ...value, [key]: e.target.value });

  return (
    <div className="surface-card space-y-3 p-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by ID, title, description or requester…"
          className="w-full rounded-lg border border-border bg-secondary py-2.5 pr-9 pl-9 text-sm outline-none focus:border-primary focus:bg-card"
        />
        {search ? (
          <button
            aria-label="Clear search"
            onClick={() => onSearchChange("")}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select label="Status" value={value.status} onChange={set("status")}
          options={getStatuses().map((s) => s.name)} />
        <Select label="Priority" value={value.priority} onChange={set("priority")}
          options={getPriorities().map((p) => p.name)} />
        <Select label="Category" value={value.category} onChange={set("category")}
          options={getCategories().map((c) => c.name)} />
        {showTeam ? (
          <Select
            label="Team"
            value={value.team}
            onChange={set("team")}
            options={getTeams().map((t) => ({ label: t.name, value: t.id }))}
          />
        ) : null}
        {activeCount > 0 || search ? (
          <button
            onClick={onReset}
            className="ml-auto text-sm font-medium text-primary hover:underline"
          >
            Clear filters{activeCount ? ` (${activeCount})` : ""}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: (string | { label: string; value: string })[];
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
      <span className="label-caps">{label}</span>
      <select value={value} onChange={onChange} className="bg-transparent text-sm outline-none">
        <option value="all">All</option>
        {options.map((o) => {
          const opt = typeof o === "string" ? { label: o, value: o } : o;
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}
