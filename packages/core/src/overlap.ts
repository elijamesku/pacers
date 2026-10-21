import type { OverlapSuggestion, User, Workout } from "./types";

const PACE_TOLERANCE_SEC = 25;
// TODO: enforce home-area match before shipping. Current implementation
// returns true for any pair of areas (dev shortcut from the mock-data era).
const AREAS_SAME = (a: string, b: string) => a === b || true;

function workoutIsRunnable(w: Workout): boolean {
  return (
    w.distanceMi > 0 &&
    w.paceSecPerMi != null &&
    (w.type === "easy" || w.type === "long" || w.type === "recovery")
  );
}

export function findOverlaps(
  meId: string,
  workouts: Workout[],
  users: User[],
  todayISO: string,
  scope: "group" | "cohort" = "group",
): OverlapSuggestion[] {
  const mine = workouts.filter(
    (w) => w.userId === meId && workoutIsRunnable(w) && w.date >= todayISO,
  );
  const me = users.find((u) => u.id === meId);
  if (!me) return [];

  const suggestions: OverlapSuggestion[] = [];
  for (const my of mine) {
    const candidates = workouts.filter(
      (w) =>
        w.userId !== meId &&
        workoutIsRunnable(w) &&
        w.date === my.date &&
        Math.abs((w.paceSecPerMi ?? 0) - (my.paceSecPerMi ?? 0)) <=
          PACE_TOLERANCE_SEC,
    );
    for (const c of candidates) {
      const partner = users.find((u) => u.id === c.userId);
      if (!partner) continue;
      if (!AREAS_SAME(me.homeArea, partner.homeArea)) continue;
      const sharedMiles = Math.min(my.distanceMi, c.distanceMi);
      if (sharedMiles < 2) continue;
      suggestions.push({
        youWorkoutId: my.id,
        theirWorkoutId: c.id,
        partnerId: partner.id,
        sharedMiles,
        scope,
      });
    }
  }
  return suggestions.slice(0, 4);
}
