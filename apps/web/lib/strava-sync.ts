import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type StravaActivity,
  type StravaTokens,
  activityToWorkoutType,
  fetchActivities,
  isSupportedActivity,
  refreshTokens,
} from "./strava";

export interface StravaConnectionRow {
  user_id: string;
  athlete_id: number;
  access_token: string;
  refresh_token: string;
  expires_at: string; // ISO
  scope: string;
  last_synced_at: string | null;
}

const STRAVA_CLIENT_ID = () => process.env.STRAVA_CLIENT_ID ?? "";
const STRAVA_CLIENT_SECRET = () => process.env.STRAVA_CLIENT_SECRET ?? "";

async function ensureFreshTokens(
  sb: SupabaseClient,
  conn: StravaConnectionRow,
): Promise<StravaConnectionRow> {
  const expiresMs = new Date(conn.expires_at).getTime();
  // Refresh 2 minutes before expiry.
  if (expiresMs - Date.now() > 2 * 60 * 1000) return conn;
  const t = await refreshTokens({
    clientId: STRAVA_CLIENT_ID(),
    clientSecret: STRAVA_CLIENT_SECRET(),
    refreshToken: conn.refresh_token,
  });
  const next: StravaConnectionRow = {
    ...conn,
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    expires_at: new Date(t.expires_at * 1000).toISOString(),
  };
  await sb
    .from("strava_connections")
    .update({
      access_token: next.access_token,
      refresh_token: next.refresh_token,
      expires_at: next.expires_at,
    })
    .eq("user_id", conn.user_id);
  return next;
}

export async function upsertConnectionFromTokens(
  sb: SupabaseClient,
  userId: string,
  tokens: StravaTokens,
): Promise<StravaConnectionRow> {
  const row = {
    user_id: userId,
    athlete_id: tokens.athlete.id,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: new Date(tokens.expires_at * 1000).toISOString(),
    scope: tokens.scope,
  };
  const { error } = await sb
    .from("strava_connections")
    .upsert(row, { onConflict: "user_id" });
  if (error) throw error;
  return { ...row, last_synced_at: null };
}

export async function fetchConnection(
  sb: SupabaseClient,
  userId: string,
): Promise<StravaConnectionRow | null> {
  const { data, error } = await sb
    .from("strava_connections")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as StravaConnectionRow | null) ?? null;
}

export async function deleteConnection(
  sb: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await sb
    .from("strava_connections")
    .delete()
    .eq("user_id", userId);
  if (error) throw error;
}

export interface SyncResult {
  imported: number;
  skipped: number;
  errors: number;
}

export async function syncActivities(
  sb: SupabaseClient,
  userId: string,
  opts: { lookbackDays?: number } = {},
): Promise<SyncResult> {
  let conn = await fetchConnection(sb, userId);
  if (!conn) throw new Error("No Strava connection for this user.");
  conn = await ensureFreshTokens(sb, conn);

  // Default lookback: 30 days on first sync, otherwise since last sync
  // (with 1-day overlap so edge activities aren't missed).
  const lookbackDays = opts.lookbackDays ?? 30;
  const lastMs = conn.last_synced_at
    ? new Date(conn.last_synced_at).getTime() - 24 * 60 * 60 * 1000
    : Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
  const afterUnix = Math.max(0, Math.floor(lastMs / 1000));

  const activities = await fetchActivities({
    accessToken: conn.access_token,
    afterUnix,
    perPage: 100,
  });

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const a of activities) {
    if (!isSupportedActivity(a)) {
      skipped++;
      continue;
    }
    try {
      const { error } = await sb.from("workouts").upsert(
        workoutRowFromActivity(userId, a),
        { onConflict: "user_id,strava_activity_id" },
      );
      if (error) throw error;
      imported++;
    } catch {
      errors++;
    }
  }

  await sb
    .from("strava_connections")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("user_id", userId);

  return { imported, skipped, errors };
}

function workoutRowFromActivity(
  userId: string,
  a: StravaActivity,
): Record<string, unknown> {
  const miles = a.distance / 1609.344;
  const paceSecPerMi =
    miles > 0 ? Math.round(a.moving_time / miles) : null;
  const date = a.start_date_local.slice(0, 10);
  return {
    user_id: userId,
    date,
    type: activityToWorkoutType(a),
    distance_mi: Number(miles.toFixed(2)),
    pace_sec_per_mi: paceSecPerMi,
    notes: a.name ?? null,
    actual_distance_mi: Number(miles.toFixed(2)),
    actual_duration_sec: a.moving_time,
    actual_pace_sec_per_mi: paceSecPerMi,
    completed: true,
    completed_at: a.start_date,
    strava_activity_id: a.id,
  };
}
