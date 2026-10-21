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

export interface User {
  id: string;
  name: string;
  handle: string;
  avatarColor: string;
  homeArea: string;
  typicalPace: string;
  footprintVisibility: FootprintVisibility;
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
}

export interface Group {
  id: string;
  name: string;
  isPrivate: boolean;
  memberIds: string[];
  description?: string;
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
}
