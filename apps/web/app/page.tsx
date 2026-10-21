"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { resolveContexts, activeGroupsForUser } from "@/lib/context";
import { toISODate } from "@pacers/core";
import { findOverlaps } from "@pacers/core";
import { TodayWorkoutHero } from "@/components/sections/TodayWorkoutHero";
import { RaceCountdownSection } from "@/components/sections/RaceCountdownSection";
import { UpcomingRunsSection } from "@/components/sections/UpcomingRunsSection";
import { OverlapSection } from "@/components/sections/OverlapSection";
import { SoloInsightsSection } from "@/components/sections/SoloInsightsSection";
import { ContextNudges } from "@/components/sections/ContextNudges";

export default function HomePage() {
  const store = useStore();
  const { me, users, workouts, groups, runs, rsvps, races, raceGoals } = store;

  const today = useMemo(() => new Date(), []);
  const todayISO = toISODate(today);

  const groupIds = useMemo(
    () => activeGroupsForUser(groups, me.id),
    [groups, me.id],
  );

  const contexts = useMemo(
    () => resolveContexts(raceGoals, races, groupIds, today),
    [raceGoals, races, groupIds, today],
  );

  const upcomingRuns = useMemo(
    () =>
      runs
        .filter((r) => r.startAt >= today.toISOString())
        .sort((a, b) => a.startAt.localeCompare(b.startAt)),
    [runs, today],
  );

  const overlaps = useMemo(
    () => findOverlaps(me.id, workouts, users, todayISO, "group"),
    [me.id, workouts, users, todayISO],
  );

  const hasRace = contexts.some((c) => c.key === "race" || c.key === "race_soon");
  const hasCrew = contexts.some((c) => c.key === "crew");
  const activeRaceGoalId = contexts.find(
    (c) => c.key === "race" || c.key === "race_soon",
  )?.raceGoalId;

  return (
    <div className="space-y-8">
      <TodayWorkoutHero today={today} />

      {activeRaceGoalId && (
        <RaceCountdownSection raceGoalId={activeRaceGoalId} today={today} />
      )}

      {upcomingRuns.length > 0 && hasCrew && (
        <UpcomingRunsSection runs={upcomingRuns} rsvps={rsvps} users={users} />
      )}

      {overlaps.length > 0 && (
        <OverlapSection overlaps={overlaps} />
      )}

      <SoloInsightsSection today={today} />

      <ContextNudges hasRace={hasRace} hasCrew={hasCrew} />
    </div>
  );
}
