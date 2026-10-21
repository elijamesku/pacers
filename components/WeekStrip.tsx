"use client";

import clsx from "clsx";
import { format, isSameDay } from "date-fns";
import { weekFromDate, WEEKDAY_LABELS } from "@/lib/date";
import type { Workout } from "@/lib/types";
import { WORKOUT_STYLES } from "@/lib/workout-style";

interface Props {
  anchor: Date;
  workouts: Workout[];
  onPickDay?: (d: Date) => void;
}

export function WeekStrip({ anchor, workouts, onPickDay }: Props) {
  const days = weekFromDate(anchor);
  const today = new Date();
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((d, i) => {
        const iso = format(d, "yyyy-MM-dd");
        const dayWorkouts = workouts.filter((w) => w.date === iso);
        const isToday = isSameDay(d, today);
        const nonRest = dayWorkouts.filter((w) => w.type !== "rest");
        return (
          <button
            key={iso}
            onClick={() => onPickDay?.(d)}
            className={clsx(
              "card p-2 md:p-3 flex flex-col items-center gap-1.5 focus-ring",
              isToday && "border-primary",
              onPickDay && "hover:bg-surface-muted transition-colors cursor-pointer",
            )}
          >
            <div className="text-[10px] uppercase tracking-wider text-muted">
              {WEEKDAY_LABELS[i]}
            </div>
            <div
              className={clsx(
                "text-lg md:text-xl font-semibold leading-none",
                isToday && "text-primary",
              )}
            >
              {format(d, "d")}
            </div>
            <div className="flex gap-0.5 h-2 items-center">
              {nonRest.length === 0 ? (
                <span className="w-1 h-1 rounded-full bg-border-strong" />
              ) : (
                nonRest.slice(0, 3).map((w) => (
                  <span
                    key={w.id}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: WORKOUT_STYLES[w.type].color }}
                  />
                ))
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
