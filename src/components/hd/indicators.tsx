import { cn } from "@/lib/utils";
import type { PriorityName, StatusName } from "@/lib/types";

const statusStyles: Record<StatusName, string> = {
  New: "bg-primary-soft text-primary",
  Assigned: "bg-info-soft text-info",
  "In Progress": "bg-warning-soft text-warning",
  Resolved: "bg-success-soft text-success",
  Closed: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status, className }: { status: StatusName; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        statusStyles[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

const priorityStyles: Record<PriorityName, string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-primary-soft text-primary",
  High: "bg-warning-soft text-warning",
  Critical: "bg-destructive-soft text-destructive",
};

const priorityGlyph: Record<PriorityName, string> = {
  Low: "↓",
  Medium: "→",
  High: "↑",
  Critical: "↑↑",
};

export function PriorityBadge({ priority, className }: { priority: PriorityName; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold whitespace-nowrap",
        priorityStyles[priority],
        className,
      )}
    >
      <span aria-hidden className="text-[10px] leading-none">
        {priorityGlyph[priority]}
      </span>
      {priority}
    </span>
  );
}

export function Avatar({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground",
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fullDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
