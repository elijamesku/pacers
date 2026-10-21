// Resolve a user's active contexts in priority order so the home page can
// compose sections based on what's actually in flight. Contexts are
// composable: a user may have multiple active at once (racer + crew + solo).
//
// Priority rules (highest first):
//   1. Race within 4 weeks  — "race_soon"
//   2. Any active race goal — "race"
//   3. Any active group     — "crew"
//   4. Baseline (always)    — "solo"

import type { Group, Race, RaceGoal } from "@pacers/core";

export type ContextKey = "race_soon" | "race" | "crew" | "solo";

export interface ActiveContext {
  key: ContextKey;
  raceGoalId?: string;
  groupId?: string;
}

const WEEKS_SOON = 4;

function daysUntil(dateISO: string, nowMs: number): number {
  const d = new Date(dateISO + "T00:00:00").getTime();
  return (d - nowMs) / 86_400_000;
}

export function resolveContexts(
  raceGoals: RaceGoal[],
  races: Race[],
  activeGroupIds: string[],
  now: Date = new Date(),
): ActiveContext[] {
  const nowMs = now.getTime();
  const contexts: ActiveContext[] = [];

  const liveGoals = raceGoals.filter(
    (g) => g.status === "training" || g.status === "tapering",
  );

  for (const g of liveGoals) {
    const race = races.find((r) => r.id === g.raceId);
    if (!race) continue;
    const days = daysUntil(race.date, nowMs);
    if (days < -7) continue; // race over
    contexts.push({
      key: days <= WEEKS_SOON * 7 ? "race_soon" : "race",
      raceGoalId: g.id,
    });
  }

  for (const groupId of activeGroupIds) {
    contexts.push({ key: "crew", groupId });
  }

  contexts.push({ key: "solo" });

  // Keep in priority order (race_soon > race > crew > solo).
  const order: Record<ContextKey, number> = {
    race_soon: 0,
    race: 1,
    crew: 2,
    solo: 3,
  };
  contexts.sort((a, b) => order[a.key] - order[b.key]);
  return contexts;
}

export function activeGroupsForUser(groups: Group[], userId: string): string[] {
  return groups.filter((g) => g.memberIds.includes(userId)).map((g) => g.id);
}
