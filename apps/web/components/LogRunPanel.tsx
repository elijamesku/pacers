import clsx from "clsx";
import type { Workout } from "@pacers/core";

const FELT_OPTIONS: Array<{
  value: NonNullable<Workout["felt"]>;
  label: string;
  emoji: string;
}> = [
  { value: "great", label: "Great", emoji: "🔥" },
  { value: "ok", label: "OK", emoji: "👍" },
  { value: "flat", label: "Flat", emoji: "😶" },
  { value: "bad", label: "Bad", emoji: "🥴" },
];

export function LogRunPanel({
  form,
  onChange,
}: {
  form: Workout;
  onChange: (patch: Partial<Workout>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="eyebrow">Effort (RPE)</div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
            const active = form.rpe === n;
            return (
              <button
                key={n}
                onClick={() => onChange({ rpe: n })}
                className={clsx(
                  "flex-1 h-8 rounded-md text-xs font-semibold num border transition-colors",
                  active
                    ? "bg-primary text-primary-ink border-primary"
                    : "bg-surface border-border text-muted-strong hover:border-primary",
                )}
                aria-label={`RPE ${n}`}
              >
                {n}
              </button>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-muted">
          <span>easy</span>
          <span>all out</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="eyebrow">How'd it feel?</div>
        <div className="grid grid-cols-4 gap-1.5">
          {FELT_OPTIONS.map((f) => {
            const active = form.felt === f.value;
            return (
              <button
                key={f.value}
                onClick={() => onChange({ felt: f.value })}
                className={clsx(
                  "py-2 rounded-md text-xs font-medium border flex flex-col items-center gap-1 transition-colors",
                  active
                    ? "bg-primary-soft border-primary text-primary"
                    : "bg-surface border-border text-muted-strong hover:border-primary",
                )}
              >
                <span className="text-base leading-none">{f.emoji}</span>
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
