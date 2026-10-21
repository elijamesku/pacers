import type { Race, RaceDistance } from "@pacers/core";

export const DISTANCE_LABEL: Record<RaceDistance, string> = {
  "5k": "5K",
  "10k": "10K",
  half: "Half",
  marathon: "Marathon",
  "50k": "50K",
  "50mi": "50 mi",
  "100k": "100K",
  "100mi": "100 mi",
  other: "Other",
};

export const DISTANCE_ORDER: RaceDistance[] = [
  "5k",
  "10k",
  "half",
  "marathon",
  "50k",
  "50mi",
  "100k",
  "100mi",
  "other",
];

export function daysUntil(dateISO: string, now: Date = new Date()): number {
  const d = new Date(dateISO + "T07:00:00").getTime();
  return Math.ceil((d - now.getTime()) / 86_400_000);
}

export function formatRaceDate(dateISO: string): string {
  return new Date(dateISO + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function difficultyLabel(score: number | undefined): {
  label: string;
  color: string;
} {
  if (score == null) return { label: "—", color: "#9ca3af" };
  if (score < 30) return { label: "Easy", color: "#059669" };
  if (score < 50) return { label: "Moderate", color: "#d97706" };
  if (score < 70) return { label: "Hard", color: "#dc2626" };
  return { label: "Brutal", color: "#7f1d1d" };
}

export function sortRacesByDate(races: Race[]): Race[] {
  return [...races].sort((a, b) => a.date.localeCompare(b.date));
}

export type Timeframe = "all" | "soon" | "mid" | "far";

export function filterByTimeframe(
  races: Race[],
  tf: Timeframe,
  now: Date = new Date(),
): Race[] {
  if (tf === "all") return races;
  return races.filter((r) => {
    const d = daysUntil(r.date, now);
    if (d < 0) return false;
    if (tf === "soon") return d <= 30;
    if (tf === "mid") return d > 30 && d <= 90;
    if (tf === "far") return d > 90;
    return true;
  });
}

export function filterByDistance(
  races: Race[],
  distance: RaceDistance | "any",
): Race[] {
  if (distance === "any") return races;
  return races.filter((r) => r.distances.includes(distance));
}

export function formatGoalTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function parseGoalTime(h: number, m: number, s: number): number {
  return h * 3600 + m * 60 + s;
}
