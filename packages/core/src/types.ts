export type WorkoutType =
  | "easy"
  | "long"
  | "tempo"
  | "intervals"
  | "race"
  | "recovery"
  | "cross"
  | "rest";

export type RsvpStatus = "going" | "maybe" | "declined";

export type FootprintVisibility = "only_me" | "friends" | "public";

export type RaceDistance =
  | "5k"
  | "10k"
  | "half"
  | "marathon"
  | "50k"
  | "50mi"
  | "100k"
  | "100mi"
  | "other";

export type PlanGoalKind =
  | "race"
  | "base_building"
  | "consistency"
  | "maintenance"
  | "fitness";

export type RaceCohortVisibility = "none" | "cohort_only" | "public";

export interface User {
  id: string;
  name: string;
  handle: string;
  avatarColor: string;
  homeArea: string;
  typicalPace: string;
  footprintVisibility: FootprintVisibility;
  // Hidden-graph: follower/following lists are never exposed via API.
  // Counts are not returned on profile responses.
  bio?: string;
  runningSinceYear?: number;
  prefersMetric?: boolean;
  shoeRotation?: string[];
}

export interface Workout {
  id: string;
  userId: string;
  date: string;
  type: WorkoutType;
  distanceMi: number;
  paceSecPerMi?: number;
  notes?: string;
  completed?: boolean;
  rpe?: number; // 1-10, logged after
  felt?: "great" | "ok" | "flat" | "bad";
  planWorkoutId?: string; // links back to the plan this fulfilled
}

export interface Group {
  id: string;
  name: string;
  isPrivate: boolean;
  memberIds: string[];
  description?: string;
  city?: string;
}

export interface ScheduledRun {
  id: string;
  groupId: string;
  startAt: string;
  distanceMi: number;
  paceSecPerMi: number;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  routeName?: string;
  notes?: string;
  createdBy: string;
}

export interface Rsvp {
  runId: string;
  userId: string;
  status: RsvpStatus;
}

export interface OverlapSuggestion {
  youWorkoutId: string;
  theirWorkoutId: string;
  partnerId: string;
  sharedMiles: number;
  scope: "group" | "cohort";
}

// ---------- Races and goals ----------

export interface Race {
  id: string;
  name: string;
  date: string; // ISO date, race morning local
  city: string;
  state: string;
  lat: number;
  lng: number;
  distances: RaceDistance[];
  courseGpxUrl?: string;
  elevationGainFt?: number;
  difficultyScore?: number; // 0-100
  registrationUrl: string;
  affiliateUrl?: string;
  description?: string;
  website?: string;
}

export interface RaceGoal {
  id: string;
  userId: string;
  raceId: string;
  distance: RaceDistance;
  goalTimeSec?: number;
  planId?: string;
  cohortVisibility: RaceCohortVisibility;
  joinedAt: string;
  status: "training" | "tapering" | "completed" | "dnf" | "withdrawn";
}

// ---------- Training plans ----------

export type PlanGoal =
  | {
      kind: "race";
      raceId: string;
      distance: RaceDistance;
      goalTimeSec?: number;
    }
  | { kind: "base_building"; targetWeeklyMi: number }
  | { kind: "consistency"; targetDaysPerWeek: number }
  | { kind: "maintenance" }
  | { kind: "fitness"; targetDaysPerWeek: number };

export interface PlanConstraints {
  daysPerWeek?: number;
  unavailableDays?: number[]; // 0 = Sunday ... 6 = Saturday
  longRunDay?: number;
  maxWeeklyIncreasePct?: number; // default 10
  includeStrengthDays?: boolean;
}

export interface PlanInputs {
  userId: string;
  goal: PlanGoal;
  startDate: string;
  endDate: string;
  currentFitness: {
    recentWeeklyMi: number;
    typicalPaceSecPerMi: number;
    recent5kSec?: number;
    recentHalfSec?: number;
    recentMarathonSec?: number;
  };
  constraints?: PlanConstraints;
}

export interface PlannedWorkout {
  id: string;
  date: string;
  type: WorkoutType;
  distanceMi: number;
  paceSecPerMi?: number;
  notes?: string;
  isKeystone?: boolean; // long runs, race-pace sessions
}

export interface TrainingPlan {
  id: string;
  userId: string;
  goal: PlanGoal;
  startDate: string;
  endDate: string;
  workouts: PlannedWorkout[];
  rationale: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

// ---------- Composable context (home screen) ----------

export interface UserContext {
  userId: string;
  activeRaceGoalIds: string[]; // may be empty
  activeGroupIds: string[]; // may be empty
  activePlanId?: string;
}
