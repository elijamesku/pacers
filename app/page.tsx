"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { StatCard } from "@/components/StatCard";
import { WeekStrip } from "@/components/WeekStrip";
import { WorkoutRow } from "@/components/WorkoutRow";
import { ScheduledRunCard } from "@/components/ScheduledRunCard";
import { OverlapCard } from "@/components/OverlapCard";
import {
  fmtDistance,
  toISODate,
  weekFromDate,
  format,
  parseISO,
  WEEKDAY_FULL,
  getDay,
} from "@/lib/date";
import { findOverlaps } from "@/lib/overlap";

export default function HomePage() {
  const { me, users, workouts, groups, runs, rsvps } = useStore();
  const today = useMemo(() => new Date(), []);
  const todayISO = toISODate(today);

  const myWeek = useMemo(() => {
    const days = weekFromDate(today);
    const startISO = toISODate(days[0]);
    const endISO = toISODate(days[6]);
    return workouts.filter(
      (w) => w.userId === me.id && w.date >= startISO && w.date <= endISO,
    );
  }, [workouts, me.id, today]);

  const todayWorkout = myWeek.find((w) => w.date === todayISO);

  const activeGroup = groups[0];
  const groupMembers = users.filter((u) => activeGroup.memberIds.includes(u.id));
  const groupMileageThisWeek = useMemo(() => {
    const days = weekFromDate(today);
    const startISO = toISODate(days[0]);
    const endISO = toISODate(days[6]);
    return workouts
      .filter(
        (w) =>
          activeGroup.memberIds.includes(w.userId) &&
          w.date >= startISO &&
          w.date <= endISO,
      )
      .reduce((sum, w) => sum + w.distanceMi, 0);
  }, [workouts, activeGroup.memberIds, today]);

  const upcomingRuns = useMemo(
    () =>
      runs
        .filter((r) => r.startAt >= today.toISOString())
        .sort((a, b) => a.startAt.localeCompare(b.startAt)),
    [runs, today],
  );

  const overlaps = useMemo(
    () => findOverlaps(me.id, workouts, users, todayISO),
    [me.id, workouts, users, todayISO],
  );

  const dayIndex = (getDay(today) + 6) % 7;
  const dayName = WEEKDAY_FULL[dayIndex];

  return (
    <div className="space-y-8">
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
                : `${dayName}: ${fmtDistance(todayWorkout.distanceMi)} ${todayWorkout.type}.`
              : `Nothing on your calendar for ${dayName}.`}
          </p>
        </div>
        <Link href="/calendar" className="btn btn-primary hidden md:inline-flex">
          <Plus size={16} />
          Add workout
        </Link>
      </header>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-sm font-semibold tracking-tight uppercase text-muted">
            This week
          </h2>
          <Link
            href="/calendar"
            className="text-xs text-muted hover:text-foreground flex items-center gap-1"
          >
            Full calendar
            <ArrowRight size={12} />
          </Link>
        </div>
        <WeekStrip anchor={today} workouts={myWeek} />
      </section>

      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard
          label={`${activeGroup.name} · this week`}
          value={`${Math.round(groupMileageThisWeek)}`}
          sub={<>group miles planned</>}
          accent
        />
        <StatCard
          label="Upcoming together"
          value={upcomingRuns.length}
          sub={<>scheduled runs</>}
        />
        <StatCard
          label="Members"
          value={groupMembers.length}
          sub={
            <Link
              href={`/groups/${activeGroup.id}`}
              className="hover:text-foreground inline-flex items-center gap-1"
            >
              Open group <ArrowRight size={11} />
            </Link>
          }
        />
      </section>

      {upcomingRuns.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight uppercase text-muted">
            Upcoming together
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {upcomingRuns.slice(0, 2).map((r) => {
              const attendees = rsvps
                .filter((x) => x.runId === r.id && x.status === "going")
                .map((x) => users.find((u) => u.id === x.userId))
                .filter(Boolean) as typeof users;
              const my = rsvps.find(
                (x) => x.runId === r.id && x.userId === me.id,
              );
              return (
                <ScheduledRunCard
                  key={r.id}
                  run={r}
                  attendees={attendees}
                  youRsvp={my?.status}
                />
              );
            })}
          </div>
        </section>
      )}

      {overlaps.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight uppercase text-muted">
            Training overlap
          </h2>
          <p className="text-xs text-muted -mt-1">
            Your schedules match. Suggested shared miles with people in your groups.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {overlaps.map((s) => {
              const partner = users.find((u) => u.id === s.partnerId)!;
              const mine = workouts.find((w) => w.id === s.youWorkoutId)!;
              const theirs = workouts.find((w) => w.id === s.theirWorkoutId)!;
              return (
                <OverlapCard
                  key={s.youWorkoutId + s.theirWorkoutId}
                  suggestion={s}
                  partner={partner}
                  mine={mine}
                  theirs={theirs}
                />
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight uppercase text-muted">
          This week&apos;s plan
        </h2>
        <div className="card divide-y divide-border">
          {myWeek
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((w) => (
              <div key={w.id} className="px-4">
                <div className="flex items-center gap-3 pt-3">
                  <div className="w-14 shrink-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted">
                      {format(parseISO(w.date + "T00:00:00"), "EEE")}
                    </div>
                    <div className="text-lg font-semibold leading-none">
                      {format(parseISO(w.date + "T00:00:00"), "d")}
                    </div>
                  </div>
                  <div className="flex-1">
                    <WorkoutRow workout={w} />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
