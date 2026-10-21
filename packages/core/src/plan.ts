import type {
  PlanInputs,
  PlannedWorkout,
  TrainingPlan,
  WorkoutType,
} from "./types";

// Deterministic stub plan generator.
// v1 produces a template plan — no LLM call, no feedback loop.
// The shape of `generatePlan` is stable so the LLM-powered engine can slot
// in behind this interface without touching callers.

const DEFAULT_LONG_RUN_DAY = 6; // Saturday
const DEFAULT_DAYS_PER_WEEK = 5;

export async function generatePlan(inputs: PlanInputs): Promise<TrainingPlan> {
  const start = parseISO(inputs.startDate);
  const end = parseISO(inputs.endDate);
  const weeks = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (7 * 86_400_000)),
  );

  const workouts: PlannedWorkout[] = [];
  const baseWeekly = Math.max(10, inputs.currentFitness.recentWeeklyMi);
  const peakWeekly = targetPeakWeekly(inputs, baseWeekly);
  const longRunDay = inputs.constraints?.longRunDay ?? DEFAULT_LONG_RUN_DAY;
  const daysPerWeek = inputs.constraints?.daysPerWeek ?? DEFAULT_DAYS_PER_WEEK;
  const unavailable = new Set(inputs.constraints?.unavailableDays ?? []);
  const easyPace = inputs.currentFitness.typicalPaceSecPerMi;

  for (let w = 0; w < weeks; w++) {
    const isDownWeek = (w + 1) % 4 === 0 && w < weeks - 2;
    const isTaperWeek = w >= weeks - 2 && inputs.goal.kind === "race";
    const weeklyMi = plannedWeeklyMiles(
      w,
      weeks,
      baseWeekly,
      peakWeekly,
      isDownWeek,
      isTaperWeek,
    );
    const weekStart = addDays(start, w * 7);
    const schedule = weekSchedule({
      goalKind: inputs.goal.kind,
      daysPerWeek,
      longRunDay,
      unavailable,
      isDownWeek,
      isTaperWeek,
    });

    const miles = allocateMiles(weeklyMi, schedule);
    for (let d = 0; d < 7; d++) {
      const type = schedule[d];
      const date = toISO(addDays(weekStart, d));
      if (type === "rest") {
        workouts.push({
          id: wid(inputs.userId, date),
          date,
          type: "rest",
          distanceMi: 0,
          notes: isDownWeek ? "Down week — rest." : undefined,
        });
        continue;
      }
      const isLong = type === "long";
      workouts.push({
        id: wid(inputs.userId, date),
        date,
        type,
        distanceMi: round1(miles[d]),
        paceSecPerMi: paceForWorkout(type, easyPace),
        isKeystone: isLong || type === "tempo" || type === "intervals",
        notes: workoutNote(type, inputs, isDownWeek, isTaperWeek),
      });
    }
  }

  const plan: TrainingPlan = {
    id: `plan_${inputs.userId}_${Date.now()}`,
    userId: inputs.userId,
    goal: inputs.goal,
    startDate: inputs.startDate,
    endDate: inputs.endDate,
    workouts,
    rationale: rationale(inputs, weeks, baseWeekly, peakWeekly),
    revision: 1,
    createdAt: nowISO(),
    updatedAt: nowISO(),
    active: true,
  };

  return plan;
}

// ---------- helpers ----------

function targetPeakWeekly(inputs: PlanInputs, base: number): number {
  const g = inputs.goal;
  if (g.kind === "race") {
    switch (g.distance) {
      case "marathon":
      case "50k":
      case "50mi":
      case "100k":
      case "100mi":
        return Math.max(base * 1.6, 40);
      case "half":
        return Math.max(base * 1.4, 30);
      case "10k":
        return Math.max(base * 1.25, 25);
      case "5k":
        return Math.max(base * 1.15, 20);
      default:
        return base * 1.25;
    }
  }
  if (g.kind === "base_building") return g.targetWeeklyMi;
  if (g.kind === "consistency") return base;
  if (g.kind === "maintenance") return base * 0.85;
  return base;
}

function plannedWeeklyMiles(
  weekIdx: number,
  totalWeeks: number,
  base: number,
  peak: number,
  isDownWeek: boolean,
  isTaperWeek: boolean,
): number {
  if (isTaperWeek) {
    const weeksLeft = totalWeeks - weekIdx;
    return weeksLeft === 1 ? peak * 0.55 : peak * 0.75;
  }
  const buildWeeks = Math.max(1, totalWeeks - 2);
  const progress = Math.min(1, weekIdx / buildWeeks);
  const target = base + (peak - base) * progress;
  return isDownWeek ? target * 0.8 : target;
}

function weekSchedule(opts: {
  goalKind: PlanInputs["goal"]["kind"];
  daysPerWeek: number;
  longRunDay: number;
  unavailable: Set<number>;
  isDownWeek: boolean;
  isTaperWeek: boolean;
}): WorkoutType[] {
  const schedule: WorkoutType[] = Array(7).fill("rest");
  const slots = pickRunDays(opts.daysPerWeek, opts.longRunDay, opts.unavailable);
  const kind = opts.goalKind;
  const includeQuality =
    !opts.isTaperWeek && !opts.isDownWeek && kind !== "maintenance";

  for (const d of slots) schedule[d] = "easy";
  schedule[opts.longRunDay] = "long";

  if (includeQuality) {
    const tempoDay = pickDay(slots, [opts.longRunDay], 2);
    const intervalsDay = pickDay(slots, [opts.longRunDay, tempoDay], 4);
    if (tempoDay !== -1) schedule[tempoDay] = "tempo";
    if (intervalsDay !== -1 && (kind === "race" || kind === "fitness")) {
      schedule[intervalsDay] = "intervals";
    }
  }

  const dayAfterLong = (opts.longRunDay + 1) % 7;
  if (schedule[dayAfterLong] === "easy") schedule[dayAfterLong] = "recovery";

  return schedule;
}

function pickRunDays(
  daysPerWeek: number,
  longRunDay: number,
  unavailable: Set<number>,
): number[] {
  const priority = [1, 3, 5, 2, 4, 0]; // Mon, Wed, Fri, Tue, Thu, Sun
  const chosen = new Set<number>([longRunDay]);
  for (const d of priority) {
    if (chosen.size >= daysPerWeek) break;
    if (unavailable.has(d)) continue;
    chosen.add(d);
  }
  return [...chosen].sort((a, b) => a - b);
}

function pickDay(slots: number[], exclude: number[], preferred: number): number {
  if (slots.includes(preferred) && !exclude.includes(preferred)) return preferred;
  for (const d of slots) {
    if (!exclude.includes(d)) return d;
  }
  return -1;
}

function allocateMiles(weeklyMi: number, schedule: WorkoutType[]): number[] {
  const weights = schedule.map(workoutWeight);
  const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
  return weights.map((w) => (weeklyMi * w) / totalWeight);
}

function workoutWeight(type: WorkoutType): number {
  switch (type) {
    case "long":
      return 2.5;
    case "tempo":
      return 1.4;
    case "intervals":
      return 1.2;
    case "easy":
      return 1.0;
    case "recovery":
      return 0.7;
    case "cross":
    case "race":
    case "rest":
    default:
      return 0;
  }
}

function paceForWorkout(type: WorkoutType, easy: number): number | undefined {
  switch (type) {
    case "easy":
      return easy;
    case "long":
      return easy + 10;
    case "recovery":
      return easy + 45;
    case "tempo":
      return Math.max(0, easy - 45);
    case "intervals":
      return Math.max(0, easy - 90);
    default:
      return undefined;
  }
}

function workoutNote(
  type: WorkoutType,
  inputs: PlanInputs,
  isDownWeek: boolean,
  isTaperWeek: boolean,
): string | undefined {
  if (isTaperWeek && type === "long") return "Taper long — short and easy.";
  if (isDownWeek && type === "long") return "Down-week long run — pull back.";
  if (type === "tempo") return "Comfortably hard. 2-4x8min or 20min continuous.";
  if (type === "intervals") {
    if (inputs.goal.kind === "race" && inputs.goal.distance === "5k") {
      return "VO2 session. 5-6x800m at goal pace with 2min jog.";
    }
    return "Repeats. 6-8x400m or 4x1k, 1:1 recovery.";
  }
  return undefined;
}

function rationale(
  inputs: PlanInputs,
  weeks: number,
  base: number,
  peak: number,
): string {
  const g = inputs.goal;
  const peakStr = `${Math.round(peak)} mpw peak`;
  const baseStr = `${Math.round(base)} mpw base`;
  if (g.kind === "race") {
    return `${weeks}-week plan for your ${g.distance}, building from ${baseStr} to ${peakStr}, with a 2-week taper. Down weeks every 4th week.`;
  }
  if (g.kind === "base_building") {
    return `${weeks}-week base build from ${baseStr} to ${peakStr}. No hard workouts in weeks 1-3; keep it mostly easy.`;
  }
  if (g.kind === "consistency") {
    return `${weeks}-week consistency plan at ${baseStr}, prioritizing days-per-week over mileage.`;
  }
  if (g.kind === "maintenance") {
    return `${weeks}-week maintenance block at ~${Math.round(peak)} mpw. Low pressure, recovery-weighted.`;
  }
  return `${weeks}-week fitness plan at ${baseStr}.`;
}

// Local date helpers to keep this module zero-dependency.
function parseISO(s: string): Date {
  return new Date(s + (s.includes("T") ? "" : "T00:00:00"));
}
function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function nowISO(): string {
  return new Date().toISOString();
}
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
function wid(userId: string, date: string): string {
  return `pw_${userId}_${date}`;
}
