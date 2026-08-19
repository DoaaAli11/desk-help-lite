const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export type DonutSlice = { label: string; value: number };

export function DonutChart({ data }: { data: DonutSlice[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <svg viewBox="0 0 160 160" className="h-40 w-40 shrink-0 -rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--secondary)" strokeWidth="20" />
        {total > 0 &&
          data.map((slice, i) => {
            const length = (slice.value / total) * circumference;
            const dash = (
              <circle
                key={slice.label}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth="20"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
              />
            );
            offset += length;
            return dash;
          })}
      </svg>

      <ul className="w-full space-y-2">
        {data.map((slice, i) => {
          const pct = total ? Math.round((slice.value / total) * 100) : 0;
          return (
            <li key={slice.label} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: PALETTE[i % PALETTE.length] }}
              />
              <span className="font-medium">{slice.label}</span>
              <span className="ml-auto text-muted-foreground">
                {slice.value} · {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
