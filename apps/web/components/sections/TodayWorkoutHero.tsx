"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import {
  WEEKDAY_FULL,
  fmtDistance,
  fmtPace,
  format,
  getDay,
  toISODate,
  weekFromDate,
} from "@pacers/core";
import { WeekStrip } from "@/components/WeekStrip";
import { WORKOUT_STYLES } from "@pacers/ui-tokens";

interface Props {
  today: Date;
}

export function TodayWorkoutHero({ today }: Props) {
  const { me, workouts } = useStore();
  const todayISO = toISODate(today);

  const myWeek = useMemo(() => {
    const days = weekFromDate(today);
    const start = toISODate(days[0]);
    const end = toISODate(days[6]);
    return workouts.filter(
      (w) => w.userId === me.id && w.date >= start && w.date <= end,
    );
  }, [workouts, me.id, today]);

  const todayWorkout = myWeek.find((w) => w.date === todayISO);
  const dayIndex = (getDay(today) + 6) % 7;
  const dayName = WEEKDAY_FULL[dayIndex];
  const style = todayWorkout ? WORKOUT_STYLES[todayWorkout.type] : null;

  return (
    <section className="space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-muted">{format(today, "EEEE, MMMM d")}</div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">
            Good morning.
          </h1>
          <p className="text-sm text-muted mt-1">
            {todayWorkout
              ? todayWorkout.type === "rest"
                ? "Today is a rest day."
                : `${dayName}: ${fmtDistance(todayWorkout.distanceMi)} ${
                    style?.label.toLowerCase() ?? todayWorkout.type
                  }.`
              : `Nothing on your calendar for ${dayName}.`}
          </p>
        </div>
        <Link href="/calendar" className="btn btn-primary hidden md:inline-flex">
          <Plus size={16} />
          Add workout
        </Link>
      </header>

      {todayWorkout && todayWorkout.type !== "rest" && style && (
        <div
          className="card p-5 flex items-center gap-4"
          style={{ background: style.bg, borderColor: "transparent" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold shrink-0"
            style={{ background: style.color }}
          >
            {style.label[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-[11px] uppercase tracking-wider font-medium"
              style={{ color: style.text }}
            >
              Today
            </div>
            <div
              className="text-xl font-semibold leading-tight"
              style={{ color: style.text }}
            >
              {fmtDistance(todayWorkout.distanceMi)} · {style.label}
            </div>
            <div className="text-sm" style={{ color: style.text }}>
              {fmtPace(todayWorkout.paceSecPerMi)}
              {todayWorkout.notes ? ` · ${todayWorkout.notes}` : ""}
            </div>
          </div>
        </div>
      )}

      <WeekStrip anchor={today} workouts={myWeek} />
    </section>
  );
}
