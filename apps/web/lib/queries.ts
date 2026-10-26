// Centralized Supabase queries + mapping from snake_case DB rows to
// camelCase @pacers/core types. Importers should never touch the client
// directly; everything that reads or writes goes through here so the
// mapping stays in one place.

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Group,
  Race,
  RaceCohortVisibility,
  RaceDistance,
  RaceGoal,
  Rsvp,
  RsvpStatus,
  ScheduledRun,
  User,
  Workout,
  WorkoutType,
  FootprintVisibility,
} from "@pacers/core";

// ---------- Row mappers ----------

type ProfileRow = {
  id: string;
  handle: string;
  name: string;
  avatar_color: string | null;
  home_area: string | null;
  typical_pace: string | null;
  bio: string | null;
  running_since_year: number | null;
  prefers_metric: boolean | null;
  footprint_visibility: FootprintVisibility | null;
  shoe_rotation: string[] | null;
};

function mapProfile(r: ProfileRow): User {
  return {
    id: r.id,
    handle: r.handle,
    name: r.name,
    avatarColor: r.avatar_color || "#0062CC",
    homeArea: r.home_area || "",
    typicalPace: r.typical_pace || "",
    footprintVisibility: r.footprint_visibility || "only_me",
    bio: r.bio ?? undefined,
    runningSinceYear: r.running_since_year ?? undefined,
    prefersMetric: r.prefers_metric ?? false,
    shoeRotation: r.shoe_rotation ?? undefined,
  };
}

type WorkoutRow = {
  id: string;
  user_id: string;
  date: string;
  type: WorkoutType;
  distance_mi: number;
  pace_sec_per_mi: number | null;
  notes: string | null;
  actual_distance_mi: number | null;
  actual_duration_sec: number | null;
  actual_pace_sec_per_mi: number | null;
  completed: boolean | null;
  completed_at: string | null;
  rpe: number | null;
  felt: "great" | "ok" | "flat" | "bad" | null;
  plan_workout_id: string | null;
};

function mapWorkout(r: WorkoutRow): Workout {
  return {
    id: r.id,
    userId: r.user_id,
    date: r.date,
    type: r.type,
    distanceMi: Number(r.distance_mi),
    paceSecPerMi: r.pace_sec_per_mi ?? undefined,
    notes: r.notes ?? undefined,
    actualDistanceMi:
      r.actual_distance_mi != null ? Number(r.actual_distance_mi) : undefined,
    actualDurationSec: r.actual_duration_sec ?? undefined,
    actualPaceSecPerMi: r.actual_pace_sec_per_mi ?? undefined,
    completed: r.completed ?? undefined,
    completedAt: r.completed_at ?? undefined,
    rpe: r.rpe ?? undefined,
    felt: r.felt ?? undefined,
    planWorkoutId: r.plan_workout_id ?? undefined,
  };
}

type GroupRow = {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  is_private: boolean;
  created_by: string;
};

function mapGroup(r: GroupRow, memberIds: string[]): Group {
  return {
    id: r.id,
    name: r.name,
    isPrivate: r.is_private,
    memberIds,
    description: r.description ?? undefined,
    city: r.city ?? undefined,
  };
}

type ScheduledRunRow = {
  id: string;
  group_id: string;
  start_at: string;
  distance_mi: number;
  pace_sec_per_mi: number;
  location_name: string;
  lat: number | null;
  lng: number | null;
  route_name: string | null;
  notes: string | null;
  created_by: string;
};

function mapScheduledRun(r: ScheduledRunRow): ScheduledRun {
  return {
    id: r.id,
    groupId: r.group_id,
    startAt: r.start_at,
    distanceMi: Number(r.distance_mi),
    paceSecPerMi: r.pace_sec_per_mi,
    location: {
      name: r.location_name,
      lat: r.lat ?? 0,
      lng: r.lng ?? 0,
    },
    routeName: r.route_name ?? undefined,
    notes: r.notes ?? undefined,
    createdBy: r.created_by,
  };
}

type RsvpRow = {
  run_id: string;
  user_id: string;
  status: RsvpStatus;
};

function mapRsvp(r: RsvpRow): Rsvp {
  return { runId: r.run_id, userId: r.user_id, status: r.status };
}

type RaceRow = {
  id: string;
  name: string;
  date: string;
  city: string;
  state: string;
  lat: number | null;
  lng: number | null;
  distances: RaceDistance[];
  course_gpx_url: string | null;
  elevation_gain_ft: number | null;
  difficulty_score: number | null;
  registration_url: string | null;
  affiliate_url: string | null;
  description: string | null;
  website: string | null;
};

function mapRace(r: RaceRow): Race {
  return {
    id: r.id,
    name: r.name,
    date: r.date,
    city: r.city,
    state: r.state,
    lat: r.lat ?? 0,
    lng: r.lng ?? 0,
    distances: r.distances,
    courseGpxUrl: r.course_gpx_url ?? undefined,
    elevationGainFt: r.elevation_gain_ft ?? undefined,
    difficultyScore: r.difficulty_score ?? undefined,
    registrationUrl: r.registration_url ?? "",
    affiliateUrl: r.affiliate_url ?? undefined,
    description: r.description ?? undefined,
    website: r.website ?? undefined,
  };
}

type RaceGoalRow = {
  id: string;
  user_id: string;
  race_id: string;
  distance: RaceDistance;
  goal_time_sec: number | null;
  plan_id: string | null;
  cohort_visibility: RaceCohortVisibility;
  joined_at: string;
  status: RaceGoal["status"];
};

function mapRaceGoal(r: RaceGoalRow): RaceGoal {
  return {
    id: r.id,
    userId: r.user_id,
    raceId: r.race_id,
    distance: r.distance,
    goalTimeSec: r.goal_time_sec ?? undefined,
    planId: r.plan_id ?? undefined,
    cohortVisibility: r.cohort_visibility,
    joinedAt: r.joined_at,
    status: r.status,
  };
}

// ---------- Reads ----------

export async function fetchMe(sb: SupabaseClient): Promise<User | null> {
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error || !data) return null;
  return mapProfile(data as ProfileRow);
}

export async function fetchRaces(sb: SupabaseClient): Promise<Race[]> {
  const { data, error } = await sb.from("races").select("*").order("date");
  if (error) throw error;
  return (data as RaceRow[] | null)?.map(mapRace) ?? [];
}

export async function fetchMyWorkouts(
  sb: SupabaseClient,
  userId: string,
): Promise<Workout[]> {
  const { data, error } = await sb
    .from("workouts")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true });
  if (error) throw error;
  return (data as WorkoutRow[] | null)?.map(mapWorkout) ?? [];
}

export async function fetchMyRaceGoals(
  sb: SupabaseClient,
  userId: string,
): Promise<RaceGoal[]> {
  const { data, error } = await sb
    .from("race_goals")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return (data as RaceGoalRow[] | null)?.map(mapRaceGoal) ?? [];
}

export async function fetchMyGroups(
  sb: SupabaseClient,
  userId: string,
): Promise<{ groups: Group[]; members: User[] }> {
  // Groups the user belongs to.
  const { data: memberships, error: mErr } = await sb
    .from("group_members")
    .select("group_id")
    .eq("user_id", userId);
  if (mErr) throw mErr;
  const groupIds = (memberships ?? []).map((m: { group_id: string }) => m.group_id);
  if (groupIds.length === 0) return { groups: [], members: [] };

  const [groupsRes, allMembersRes] = await Promise.all([
    sb.from("groups").select("*").in("id", groupIds),
    sb.from("group_members").select("group_id,user_id").in("group_id", groupIds),
  ]);
  if (groupsRes.error) throw groupsRes.error;
  if (allMembersRes.error) throw allMembersRes.error;

  const byGroup = new Map<string, string[]>();
  for (const m of (allMembersRes.data as { group_id: string; user_id: string }[]) ?? []) {
    const arr = byGroup.get(m.group_id) ?? [];
    arr.push(m.user_id);
    byGroup.set(m.group_id, arr);
  }
  const groups = (groupsRes.data as GroupRow[]).map((r) =>
    mapGroup(r, byGroup.get(r.id) ?? []),
  );
  const memberIds = Array.from(new Set((allMembersRes.data as { user_id: string }[]).map((m) => m.user_id)));

  const { data: profiles, error: pErr } = await sb
    .from("profiles")
    .select("*")
    .in("id", memberIds);
  if (pErr) throw pErr;
  const members = (profiles as ProfileRow[] | null)?.map(mapProfile) ?? [];
  return { groups, members };
}

export async function fetchGroupRunsAndRsvps(
  sb: SupabaseClient,
  groupIds: string[],
): Promise<{ runs: ScheduledRun[]; rsvps: Rsvp[] }> {
  if (groupIds.length === 0) return { runs: [], rsvps: [] };
  const { data: runs, error: rErr } = await sb
    .from("scheduled_runs")
    .select("*")
    .in("group_id", groupIds)
    .order("start_at");
  if (rErr) throw rErr;
  const runIds = (runs as ScheduledRunRow[] | null)?.map((r) => r.id) ?? [];
  if (runIds.length === 0) {
    return { runs: (runs as ScheduledRunRow[] | null)?.map(mapScheduledRun) ?? [], rsvps: [] };
  }
  const { data: rsvps, error: sErr } = await sb
    .from("rsvps")
    .select("*")
    .in("run_id", runIds);
  if (sErr) throw sErr;
  return {
    runs: (runs as ScheduledRunRow[]).map(mapScheduledRun),
    rsvps: (rsvps as RsvpRow[] | null)?.map(mapRsvp) ?? [],
  };
}

// ---------- Writes ----------

export async function createWorkout(
  sb: SupabaseClient,
  userId: string,
  w: Omit<Workout, "id" | "userId">,
): Promise<Workout> {
  const { data, error } = await sb
    .from("workouts")
    .insert({
      user_id: userId,
      date: w.date,
      type: w.type,
      distance_mi: w.distanceMi,
      pace_sec_per_mi: w.paceSecPerMi ?? null,
      notes: w.notes ?? null,
      completed: w.completed ?? false,
      rpe: w.rpe ?? null,
      felt: w.felt ?? null,
      plan_workout_id: w.planWorkoutId ?? null,
    })
    .select()
    .single();
  if (error || !data) throw error ?? new Error("createWorkout failed");
  return mapWorkout(data as WorkoutRow);
}

export async function updateWorkout(
  sb: SupabaseClient,
  workoutId: string,
  patch: Partial<Omit<Workout, "id" | "userId">>,
): Promise<Workout> {
  const row: Record<string, unknown> = {};
  if (patch.date !== undefined) row.date = patch.date;
  if (patch.type !== undefined) row.type = patch.type;
  if (patch.distanceMi !== undefined) row.distance_mi = patch.distanceMi;
  if (patch.paceSecPerMi !== undefined) row.pace_sec_per_mi = patch.paceSecPerMi;
  if (patch.notes !== undefined) row.notes = patch.notes;
  if (patch.actualDistanceMi !== undefined)
    row.actual_distance_mi = patch.actualDistanceMi;
  if (patch.actualDurationSec !== undefined)
    row.actual_duration_sec = patch.actualDurationSec;
  if (patch.actualPaceSecPerMi !== undefined)
    row.actual_pace_sec_per_mi = patch.actualPaceSecPerMi;
  if (patch.completed !== undefined) row.completed = patch.completed;
  if (patch.completedAt !== undefined) row.completed_at = patch.completedAt;
  if (patch.rpe !== undefined) row.rpe = patch.rpe;
  if (patch.felt !== undefined) row.felt = patch.felt;
  const { data, error } = await sb
    .from("workouts")
    .update(row)
    .eq("id", workoutId)
    .select()
    .single();
  if (error || !data) throw error ?? new Error("updateWorkout failed");
  return mapWorkout(data as WorkoutRow);
}

export async function deleteWorkout(
  sb: SupabaseClient,
  workoutId: string,
): Promise<void> {
  const { error } = await sb.from("workouts").delete().eq("id", workoutId);
  if (error) throw error;
}

export async function createRaceGoal(
  sb: SupabaseClient,
  userId: string,
  g: Omit<RaceGoal, "id" | "userId" | "joinedAt" | "status">,
): Promise<RaceGoal> {
  const { data, error } = await sb
    .from("race_goals")
    .insert({
      user_id: userId,
      race_id: g.raceId,
      distance: g.distance,
      goal_time_sec: g.goalTimeSec ?? null,
      plan_id: g.planId ?? null,
      cohort_visibility: g.cohortVisibility,
    })
    .select()
    .single();
  if (error || !data) throw error ?? new Error("createRaceGoal failed");
  return mapRaceGoal(data as RaceGoalRow);
}

export async function deleteRaceGoal(
  sb: SupabaseClient,
  goalId: string,
): Promise<void> {
  const { error } = await sb.from("race_goals").delete().eq("id", goalId);
  if (error) throw error;
}

export async function upsertRsvp(
  sb: SupabaseClient,
  userId: string,
  runId: string,
  status: RsvpStatus,
): Promise<Rsvp> {
  const { data, error } = await sb
    .from("rsvps")
    .upsert({ run_id: runId, user_id: userId, status }, { onConflict: "run_id,user_id" })
    .select()
    .single();
  if (error || !data) throw error ?? new Error("upsertRsvp failed");
  return mapRsvp(data as RsvpRow);
}

export async function createScheduledRun(
  sb: SupabaseClient,
  userId: string,
  r: Omit<ScheduledRun, "id" | "createdBy">,
): Promise<ScheduledRun> {
  const { data, error } = await sb
    .from("scheduled_runs")
    .insert({
      group_id: r.groupId,
      start_at: r.startAt,
      distance_mi: r.distanceMi,
      pace_sec_per_mi: r.paceSecPerMi,
      location_name: r.location.name,
      lat: r.location.lat,
      lng: r.location.lng,
      route_name: r.routeName ?? null,
      notes: r.notes ?? null,
      created_by: userId,
    })
    .select()
    .single();
  if (error || !data) throw error ?? new Error("createScheduledRun failed");
  return mapScheduledRun(data as ScheduledRunRow);
}

export async function joinGroup(
  sb: SupabaseClient,
  userId: string,
  groupId: string,
): Promise<void> {
  const { error } = await sb
    .from("group_members")
    .upsert({ group_id: groupId, user_id: userId }, { onConflict: "group_id,user_id" });
  if (error) throw error;
}
