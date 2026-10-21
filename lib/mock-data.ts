import type {
  Group,
  Rsvp,
  ScheduledRun,
  User,
  Workout,
} from "./types";

export const CURRENT_USER_ID = "u_me";

export const USERS: User[] = [
  {
    id: "u_me",
    name: "You",
    handle: "me",
    avatarColor: "#047857",
    homeArea: "Riverfront",
    typicalPace: "8:30/mi",
    footprintVisibility: "only_me",
  },
  {
    id: "u_alex",
    name: "Alex Chen",
    handle: "alexc",
    avatarColor: "#2563eb",
    homeArea: "West Hill",
    typicalPace: "8:40/mi",
    footprintVisibility: "friends",
  },
  {
    id: "u_priya",
    name: "Priya Rao",
    handle: "priyar",
    avatarColor: "#db2777",
    homeArea: "Downtown",
    typicalPace: "8:15/mi",
    footprintVisibility: "friends",
  },
  {
    id: "u_jordan",
    name: "Jordan Reyes",
    handle: "jreyes",
    avatarColor: "#d97706",
    homeArea: "North Loop",
    typicalPace: "8:50/mi",
    footprintVisibility: "only_me",
  },
];

export const GROUPS: Group[] = [
  {
    id: "g_morning",
    name: "Morning Crew",
    isPrivate: true,
    memberIds: ["u_me", "u_alex", "u_priya", "u_jordan"],
    description:
      "Training for the city half-marathon in December. Early birds, easy miles, and the Saturday long run.",
  },
  {
    id: "g_long",
    name: "Half Marathon Build",
    isPrivate: true,
    memberIds: ["u_me", "u_priya"],
    description: "Peak block with Priya — tempos and long progressions.",
  },
];

const d = (iso: string, hour = 7, minute = 0): string => {
  const dt = new Date(`${iso}T00:00:00`);
  dt.setHours(hour, minute, 0, 0);
  return dt.toISOString();
};

const pace = (mm: number, ss: number): number => mm * 60 + ss;

export const WORKOUTS: Workout[] = [
  { id: "w1", userId: "u_me", date: "2026-10-19", type: "easy", distanceMi: 5, paceSecPerMi: pace(8, 45), completed: true },
  { id: "w2", userId: "u_me", date: "2026-10-20", type: "tempo", distanceMi: 6, paceSecPerMi: pace(7, 30), notes: "3 miles at threshold" },
  { id: "w3", userId: "u_me", date: "2026-10-21", type: "easy", distanceMi: 8, paceSecPerMi: pace(8, 30) },
  { id: "w4", userId: "u_me", date: "2026-10-22", type: "intervals", distanceMi: 7, paceSecPerMi: pace(7, 15), notes: "6×800m with 400 jog" },
  { id: "w5", userId: "u_me", date: "2026-10-23", type: "rest", distanceMi: 0 },
  { id: "w6", userId: "u_me", date: "2026-10-24", type: "long", distanceMi: 14, paceSecPerMi: pace(8, 30) },
  { id: "w7", userId: "u_me", date: "2026-10-25", type: "recovery", distanceMi: 4, paceSecPerMi: pace(9, 15) },

  { id: "w8", userId: "u_alex", date: "2026-10-19", type: "easy", distanceMi: 4, paceSecPerMi: pace(8, 55), completed: true },
  { id: "w9", userId: "u_alex", date: "2026-10-20", type: "easy", distanceMi: 6, paceSecPerMi: pace(8, 40) },
  { id: "w10", userId: "u_alex", date: "2026-10-21", type: "easy", distanceMi: 10, paceSecPerMi: pace(8, 40) },
  { id: "w11", userId: "u_alex", date: "2026-10-22", type: "rest", distanceMi: 0 },
  { id: "w12", userId: "u_alex", date: "2026-10-23", type: "tempo", distanceMi: 7, paceSecPerMi: pace(7, 40) },
  { id: "w13", userId: "u_alex", date: "2026-10-24", type: "long", distanceMi: 12, paceSecPerMi: pace(8, 35) },
  { id: "w14", userId: "u_alex", date: "2026-10-25", type: "easy", distanceMi: 5, paceSecPerMi: pace(9, 0) },

  { id: "w15", userId: "u_priya", date: "2026-10-19", type: "cross", distanceMi: 0, notes: "Spin class" },
  { id: "w16", userId: "u_priya", date: "2026-10-20", type: "intervals", distanceMi: 8, paceSecPerMi: pace(6, 55) },
  { id: "w17", userId: "u_priya", date: "2026-10-21", type: "easy", distanceMi: 7, paceSecPerMi: pace(8, 20) },
  { id: "w18", userId: "u_priya", date: "2026-10-22", type: "easy", distanceMi: 5, paceSecPerMi: pace(8, 30) },
  { id: "w19", userId: "u_priya", date: "2026-10-23", type: "rest", distanceMi: 0 },
  { id: "w20", userId: "u_priya", date: "2026-10-24", type: "long", distanceMi: 16, paceSecPerMi: pace(8, 15) },
  { id: "w21", userId: "u_priya", date: "2026-10-25", type: "easy", distanceMi: 6, paceSecPerMi: pace(8, 45) },

  { id: "w22", userId: "u_jordan", date: "2026-10-19", type: "easy", distanceMi: 5, paceSecPerMi: pace(9, 0), completed: true },
  { id: "w23", userId: "u_jordan", date: "2026-10-20", type: "tempo", distanceMi: 6, paceSecPerMi: pace(7, 55) },
  { id: "w24", userId: "u_jordan", date: "2026-10-21", type: "easy", distanceMi: 6, paceSecPerMi: pace(8, 50) },
  { id: "w25", userId: "u_jordan", date: "2026-10-22", type: "intervals", distanceMi: 6, paceSecPerMi: pace(7, 20) },
  { id: "w26", userId: "u_jordan", date: "2026-10-23", type: "easy", distanceMi: 4, paceSecPerMi: pace(9, 5) },
  { id: "w27", userId: "u_jordan", date: "2026-10-25", type: "long", distanceMi: 10, paceSecPerMi: pace(8, 50) },
];

export const SCHEDULED_RUNS: ScheduledRun[] = [
  {
    id: "sr_sat_long",
    groupId: "g_morning",
    startAt: d("2026-10-24", 7, 0),
    distanceMi: 14,
    paceSecPerMi: pace(8, 30),
    location: { name: "Riverfront Trailhead", lat: 40.7589, lng: -73.9851 },
    routeName: "River Loop → Bridge → Return",
    notes: "Easy pace long run. Coffee after at the trailhead cafe.",
    createdBy: "u_me",
  },
  {
    id: "sr_wed_easy",
    groupId: "g_morning",
    startAt: d("2026-10-21", 6, 0),
    distanceMi: 8,
    paceSecPerMi: pace(8, 30),
    location: { name: "Riverfront Trailhead", lat: 40.7589, lng: -73.9851 },
    routeName: "River Loop",
    notes: "Easy conversational pace. Alex is running 10 total.",
    createdBy: "u_alex",
  },
];

export const RSVPS: Rsvp[] = [
  { runId: "sr_sat_long", userId: "u_me", status: "going" },
  { runId: "sr_sat_long", userId: "u_alex", status: "going" },
  { runId: "sr_sat_long", userId: "u_priya", status: "going" },
  { runId: "sr_sat_long", userId: "u_jordan", status: "declined" },
  { runId: "sr_wed_easy", userId: "u_me", status: "maybe" },
  { runId: "sr_wed_easy", userId: "u_alex", status: "going" },
];
