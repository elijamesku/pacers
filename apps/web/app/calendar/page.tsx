"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, Plus, Search, Upload } from "lucide-react";
import { isSameDay } from "date-fns";
import { useStore } from "@/lib/store";
import {
  addWeeks,
  format,
  subWeeks,
  toISODate,
  weekFromDate,
  WEEKDAY_FULL,
} from "@pacers/core";
import type { Workout } from "@pacers/core";
import { WorkoutDayCard } from "@/components/WorkoutDayCard";
import { WeekSummary } from "@/components/WeekSummary";
import { AddWorkoutDialog } from "@/components/AddWorkoutDialog";

export default function CalendarPage() {
  const { me, workouts } = useStore();
  const [anchor, setAnchor] = useState<Date>(() => new Date());
  const [addDate, setAddDate] = useState<string | null>(null);

  const week = useMemo(() => weekFromDate(anchor), [anchor]);
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

  const weekWorkouts = useMemo(() => {
    const isoSet = new Set(week.map(toISODate));
    return mine.filter((w) => isoSet.has(w.date));
  }, [mine, week]);

  const monthLabel = format(anchor, "MMMM yyyy");

  return (
    <div className="space-y-4">
      {/* Toolbar row */}
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-lg md:text-xl font-semibold tracking-tight">
            {monthLabel}
          </h1>
          <button
            onClick={() => setAnchor(new Date())}
            className="btn btn-ghost text-xs px-3 py-1.5"
          >
            Today
          </button>
          <div className="flex items-center">
            <button
              onClick={() => setAnchor((a) => subWeeks(a, 1))}
              className="btn btn-ghost p-1.5"
              aria-label="Previous week"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setAnchor((a) => addWeeks(a, 1))}
              className="btn btn-ghost p-1.5"
              aria-label="Next week"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost p-1.5" aria-label="Search" title="Search">
            <Search size={16} />
          </button>
          <button className="btn btn-ghost p-1.5" aria-label="Upload" title="Upload activity">
            <Upload size={16} />
          </button>
          <button
            onClick={() => setAddDate(toISODate(new Date()))}
            className="btn btn-primary text-xs"
          >
            <Plus size={14} />
            <span className="hidden md:inline">Add workout</span>
          </button>
        </div>
      </header>

      <div className="flex gap-4 items-start">
        {/* Week grid */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-7 gap-2">
            {week.map((d, i) => {
              const iso = toISODate(d);
              const isToday = isSameDay(d, new Date());
              const dayWorkouts = byDay.get(iso) ?? [];
              return (
                <div key={iso} className="min-w-0">
                  <div
                    className={clsx(
                      "px-2 py-1.5 mb-1.5 rounded-md flex items-baseline justify-between",
                      isToday ? "bg-primary text-primary-ink" : "text-muted-strong",
                    )}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wider">
                      {WEEKDAY_FULL[i].slice(0, 3)}
                    </span>
                    <span
                      className={clsx(
                        "text-sm font-semibold",
                        isToday ? "text-primary-ink" : "text-foreground",
                      )}
                    >
                      {isToday ? `Today ${format(d, "d")}` : format(d, "d")}
                    </span>
                  </div>

                  <div className="space-y-1.5 min-h-[200px]">
                    {dayWorkouts.length === 0 ? (
                      <button
                        onClick={() => setAddDate(iso)}
                        className="w-full h-16 border border-dashed border-border rounded-md flex items-center justify-center text-muted hover:border-primary hover:text-primary transition-colors"
                        aria-label={`Add workout on ${format(d, "EEEE")}`}
                      >
                        <Plus size={14} />
                      </button>
                    ) : (
                      <>
                        {dayWorkouts.map((w) => (
                          <WorkoutDayCard key={w.id} workout={w} />
                        ))}
                        <button
                          onClick={() => setAddDate(iso)}
                          className="w-full h-7 border border-dashed border-border rounded-md flex items-center justify-center text-muted hover:border-primary hover:text-primary transition-colors"
                          aria-label={`Add another workout on ${format(d, "EEEE")}`}
                        >
                          <Plus size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <WeekSummary weekWorkouts={weekWorkouts} />
      </div>

      {addDate && (
        <AddWorkoutDialog
          initialDate={addDate}
          onClose={() => setAddDate(null)}
        />
      )}
    </div>
  );
}
