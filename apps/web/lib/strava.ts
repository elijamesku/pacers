// Strava API client. All functions are stateless; the caller owns tokens.
// Docs: https://developers.strava.com/docs/reference/

const AUTH_BASE = "https://www.strava.com/oauth";
const API_BASE = "https://www.strava.com/api/v3";

export const STRAVA_SCOPE = "read,activity:read";

export function stravaAuthorizeUrl(opts: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const u = new URL(`${AUTH_BASE}/authorize`);
  u.searchParams.set("client_id", opts.clientId);
  u.searchParams.set("redirect_uri", opts.redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("approval_prompt", "auto");
  u.searchParams.set("scope", STRAVA_SCOPE);
  u.searchParams.set("state", opts.state);
  return u.toString();
}

export interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix seconds
  athlete: { id: number };
  scope: string;
}

export async function exchangeCodeForTokens(opts: {
  clientId: string;
  clientSecret: string;
  code: string;
  scope?: string;
}): Promise<StravaTokens> {
  const res = await fetch(`${AUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: opts.clientId,
      client_secret: opts.clientSecret,
      code: opts.code,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    throw new Error(`Strava token exchange ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as StravaTokens & { scope?: string };
  return { ...data, scope: data.scope ?? opts.scope ?? STRAVA_SCOPE };
}

export async function refreshTokens(opts: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<StravaTokens> {
  const res = await fetch(`${AUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: opts.clientId,
      client_secret: opts.clientSecret,
      grant_type: "refresh_token",
      refresh_token: opts.refreshToken,
    }),
  });
  if (!res.ok) {
    throw new Error(`Strava refresh ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as StravaTokens;
}

export interface StravaActivity {
  id: number;
  name: string;
  distance: number; // meters
  moving_time: number; // seconds
  elapsed_time: number;
  total_elevation_gain: number; // meters
  type: string; // "Run", "Ride", etc.
  sport_type: string; // "Run", "TrailRun", "VirtualRun", etc.
  workout_type?: number | null;
  start_date: string; // ISO
  start_date_local: string;
  average_speed?: number; // m/s
  average_heartrate?: number;
  max_heartrate?: number;
}

export async function fetchActivities(opts: {
  accessToken: string;
  afterUnix?: number;
  perPage?: number;
}): Promise<StravaActivity[]> {
  const u = new URL(`${API_BASE}/athlete/activities`);
  u.searchParams.set("per_page", String(opts.perPage ?? 100));
  if (opts.afterUnix) u.searchParams.set("after", String(opts.afterUnix));
  const res = await fetch(u, {
    headers: { Authorization: `Bearer ${opts.accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Strava activities ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as StravaActivity[];
}

// Only runs — Pacers is run-first. Walks/rides map to "cross" so a daily
// cross-training ride still shows up.
export function isSupportedActivity(a: StravaActivity): boolean {
  const t = a.sport_type || a.type;
  return [
    "Run",
    "TrailRun",
    "VirtualRun",
    "Walk",
    "Hike",
    "Ride",
    "VirtualRide",
    "EBikeRide",
    "Workout",
    "WeightTraining",
  ].includes(t);
}

export function activityToWorkoutType(
  a: StravaActivity,
): "easy" | "long" | "tempo" | "intervals" | "race" | "recovery" | "cross" {
  const t = a.sport_type || a.type;
  if (t === "Ride" || t === "VirtualRide" || t === "EBikeRide") return "cross";
  if (t === "Walk" || t === "Hike" || t === "Workout" || t === "WeightTraining")
    return "cross";
  // Runs: use Strava's workout_type when set, else infer from distance.
  // 0=default, 1=race, 2=long, 3=workout(tempo).
  if (a.workout_type === 1) return "race";
  if (a.workout_type === 2) return "long";
  if (a.workout_type === 3) return "tempo";
  const miles = a.distance / 1609.344;
  if (miles >= 10) return "long";
  return "easy";
}
