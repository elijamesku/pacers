import Link from "next/link";
import clsx from "clsx";
import { Check } from "lucide-react";
import type { Workout } from "@pacers/core";
import { WorkoutTypeIcon } from "./WorkoutTypeIcon";

function fmtDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}:00`;
  return `${h}:${m.toString().padStart(2, "0")}:00`;
}

export function WorkoutDayCard({ workout }: { workout: Workout }) {
  // Estimate duration from distance + pace (fallback 10:00/mi).
  const paceSec = workout.paceSecPerMi ?? 600;
  const durationMin = Math.max(1, Math.round((workout.distanceMi * paceSec) / 60));

  const title = labelFor(workout);
  const notes = (workout.notes ?? "").trim();

  return (
    <Link
      href={`/workouts/${workout.id}`}
      className={clsx(
        "wo-card",
        `wo-${workout.type}`,
        "block focus-ring hover:shadow-sm transition-shadow",
        workout.completed && "opacity-80",
      )}
    >
      <div className="wo-head">
        <span className="wo-icon">
          <WorkoutTypeIcon type={workout.type} size={16} />
        </span>
        <span className="wo-title flex-1">{title}</span>
        {workout.completed && (
          <span
            className="w-4 h-4 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0"
            aria-label="Completed"
          >
            <Check size={10} strokeWidth={3} />
          </span>
        )}
      </div>
      <div className="wo-dur">
        {fmtDuration(durationMin)}
        {workout.distanceMi > 0 && (
          <span className="ml-1 opacity-70">· {workout.distanceMi.toFixed(1)} mi</span>
        )}
      </div>
      {notes && <div className="wo-notes">{notes}</div>}
    </Link>
  );
}

function labelFor(w: Workout): string {
  if (w.type === "easy") return `Easy Run${hoursSuffix(w)}`;
  if (w.type === "long") return `Long Run${hoursSuffix(w)}`;
  if (w.type === "tempo") return "Tempo";
  if (w.type === "intervals") return "Intervals";
  if (w.type === "race") return "Race Day";
  if (w.type === "recovery") return "Recovery";
  if (w.type === "cross") return "Cross Train";
  return "Rest";
}

function hoursSuffix(w: Workout): string {
  const paceSec = w.paceSecPerMi ?? 600;
  const min = Math.round((w.distanceMi * paceSec) / 60);
  const h = min / 60;
  if (h >= 1) return ` ${Math.round(h * 10) / 10}hr`;
  return ` ${min}min`;
}
