import { CheckCircle2, Circle } from "lucide-react";
import { fmtDistance, fmtPace } from "@pacers/core";
import type { Workout } from "@pacers/core";
import { WORKOUT_STYLES } from "@pacers/ui-tokens";

interface Props {
  workout: Workout;
  compact?: boolean;
}

export function WorkoutRow({ workout, compact }: Props) {
  const style = WORKOUT_STYLES[workout.type];
  const isRest = workout.type === "rest";

  return (
    <div className="flex items-start gap-3 py-2.5">
      <span
        aria-hidden
        className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
        style={{ background: style.bg, color: style.text }}
      >
        {style.label}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          {isRest ? (
            <span className="text-muted">Rest day</span>
          ) : (
            <>
              <span>{fmtDistance(workout.distanceMi)}</span>
              <span className="text-muted">·</span>
              <span className="text-muted font-normal">
                {fmtPace(workout.paceSecPerMi)}
              </span>
            </>
          )}
        </div>
        {!compact && workout.notes && (
          <div className="text-xs text-muted mt-0.5 leading-relaxed">
            {workout.notes}
          </div>
        )}
      </div>
      {!isRest && (
        <span className="shrink-0 mt-0.5" aria-hidden>
          {workout.completed ? (
            <CheckCircle2 size={16} className="text-primary" />
          ) : (
            <Circle size={16} className="text-border-strong" />
          )}
        </span>
      )}
    </div>
  );
}
