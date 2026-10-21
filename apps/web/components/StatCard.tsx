import type { ReactNode } from "react";

interface Props {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: boolean;
}

export function StatCard({ label, value, sub, accent }: Props) {
  return (
    <div
      className="card p-4 md:p-5 flex flex-col gap-1"
      style={accent ? { background: "var(--primary-soft)", borderColor: "transparent" } : undefined}
    >
      <div className="text-[11px] uppercase tracking-wider text-muted font-medium">
        {label}
      </div>
      <div className="text-2xl md:text-3xl font-semibold tracking-tight">
        {value}
      </div>
      {sub && <div className="text-xs text-muted">{sub}</div>}
    </div>
  );
}
