"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  WEEKDAY_LABELS,
  addMonths,
  format,
  monthGrid,
  parseISO,
  startOfMonth,
  subMonths,
  toISODate,
} from "@pacers/core";
import { isSameDay, isSameMonth } from "date-fns";
import { WORKOUT_STYLES } from "@pacers/ui-tokens";
import { WorkoutRow } from "@/components/WorkoutRow";
import { AddWorkoutDialog } from "@/components/AddWorkoutDialog";
import type { Workout } from "@pacers/core";

export default function CalendarPage() {
  const { me, workouts } = useStore();
  const [anchor, setAnchor] = useState<Date>(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<Date>(() => new Date());
  const [showAdd, setShowAdd] = useState(false);

  const days = useMemo(() => monthGrid(anchor), [anchor]);
  const mine = useMemo(
    () => workouts.filter((w) => w.userId === me.id),
    [workouts, me.id],
  );
  const byDay = useMemo(() => {
    const map = new Map<string, Workout[]>();
    for (const w of mine) {
      if (!map.has(w.date)) map.set(w.date, []);
      map.get(w.date)!.push(w);
    }
    return map;
  }, [mine]);

  const selectedWorkouts = byDay.get(toISODate(selected)) ?? [];
  const monthLabel = format(anchor, "MMMM yyyy");

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Calendar
          </h1>
          <p className="text-sm text-muted mt-1">
            Your training plan. Tap a day to see it.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn btn-primary"
          aria-label="Add workout"
        >
          <Plus size={16} />
          <span className="hidden md:inline">Add workout</span>
        </button>
      </header>

      <div className="card p-3 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold tracking-tight">{monthLabel}</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setAnchor((a) => subMonths(a, 1))}
              className="btn btn-ghost p-2"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setAnchor(startOfMonth(new Date()))}
              className="btn btn-ghost text-xs px-3 py-2"
            >
              Today
            </button>
            <button
              onClick={() => setAnchor((a) => addMonths(a, 1))}
              className="btn btn-ghost p-2"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-[10px] uppercase tracking-wider text-muted mb-1">
          {WEEKDAY_LABELS.map((l, i) => (
            <div key={i} className="text-center py-1">
              {l}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const iso = toISODate(d);
            const inMonth = isSameMonth(d, anchor);
            const isToday = isSameDay(d, new Date());
            const isSelected = isSameDay(d, selected);
            const dayWorkouts = byDay.get(iso) ?? [];
            const nonRest = dayWorkouts.filter((w) => w.type !== "rest");
            return (
              <button
                key={iso}
                onClick={() => setSelected(d)}
                className={clsx(
                  "aspect-square md:aspect-auto md:min-h-20 p-1 md:p-2 rounded-lg flex flex-col items-start gap-1 border transition-colors focus-ring",
                  isSelected
                    ? "border-primary bg-primary-soft/50"
                    : "border-transparent hover:bg-surface-muted",
                  !inMonth && "opacity-40",
                )}
              >
                <span
                  className={clsx(
                    "text-xs md:text-sm font-medium",
                    isToday && "text-primary font-semibold",
                  )}
                >
                  {format(d, "d")}
                </span>
                <div className="flex flex-wrap gap-0.5 w-full">
                  {nonRest.slice(0, 3).map((w) => (
                    <span
                      key={w.id}
                      className="hidden md:inline-flex text-[10px] px-1 rounded truncate max-w-full"
                      style={{
                        background: WORKOUT_STYLES[w.type].bg,
                        color: WORKOUT_STYLES[w.type].text,
                      }}
                    >
                      {Math.round(w.distanceMi)}
                      <span className="opacity-60">
                        {" "}
                        {WORKOUT_STYLES[w.type].label.slice(0, 1).toLowerCase()}
                      </span>
                    </span>
                  ))}
                  <div className="md:hidden flex gap-0.5">
                    {nonRest.slice(0, 3).map((w) => (
                      <span
                        key={w.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: WORKOUT_STYLES[w.type].color }}
                      />
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight uppercase text-muted">
          {format(selected, "EEEE, MMMM d")}
        </h2>
        <div className="card">
          {selectedWorkouts.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted text-center">
              Nothing planned. Press{" "}
              <button
                onClick={() => setShowAdd(true)}
                className="text-primary hover:underline"
              >
                add workout
              </button>{" "}
              to put something here.
            </div>
          ) : (
            <div className="divide-y divide-border px-4">
              {selectedWorkouts.map((w) => (
                <WorkoutRow key={w.id} workout={w} />
              ))}
            </div>
          )}
        </div>
      </section>

      {showAdd && (
        <AddWorkoutDialog
          initialDate={toISODate(selected)}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
