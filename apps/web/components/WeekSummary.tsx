import type { Workout } from "@pacers/core";

function fmtH(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

function minFor(w: Workout): number {
  const paceSec = w.paceSecPerMi ?? 600;
  return Math.round((w.distanceMi * paceSec) / 60);
}

export function WeekSummary({ weekWorkouts }: { weekWorkouts: Workout[] }) {
  const run = weekWorkouts.filter((w) =>
    ["easy", "long", "tempo", "intervals", "race", "recovery"].includes(w.type),
  );
  const bike: Workout[] = []; // separate biking category — add later when model splits
  const cross = weekWorkouts.filter((w) => w.type === "cross");

  const totalMin = weekWorkouts.reduce((n, w) => n + minFor(w), 0);
  const runMin = run.reduce((n, w) => n + minFor(w), 0);
  const bikeMin = bike.reduce((n, w) => n + minFor(w), 0);
  const crossMin = cross.reduce((n, w) => n + minFor(w), 0);
  const runMi = run.reduce((n, w) => n + w.distanceMi, 0);

  const rows: Array<[string, string]> = [
    ["Total Duration", fmtH(totalMin)],
    ["Run Duration", fmtH(runMin)],
    ["Run Distance", `${runMi.toFixed(1)} mi`],
    ["Bike Duration", fmtH(bikeMin)],
    ["Crosstrain Duration", fmtH(crossMin)],
  ];

  return (
    <aside className="hidden xl:block w-72 shrink-0 space-y-5">
      <div className="card p-4 space-y-3">
        <div className="eyebrow">Performance Metrics</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Metric label="Fitness" value="—" color="var(--primary)" />
          <Metric label="Fatigue" value="—" color="#DC2626" />
          <Metric label="Form" value="—" color="#D97706" />
        </div>
        <p className="text-[11px] text-muted leading-snug">
          Metrics unlock once you log a few workouts.
        </p>
      </div>

      <div className="card p-4 space-y-2">
        <div className="eyebrow mb-1">Week Totals</div>
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between text-sm border-b border-border last:border-0 py-1.5"
          >
            <span className="text-muted-strong">{k}</span>
            <span className="font-semibold num">{v}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div>
      <div
        className="text-[10px] font-semibold uppercase tracking-wider"
        style={{ color }}
      >
        {label}
      </div>
      <div className="stat-med mt-1" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
