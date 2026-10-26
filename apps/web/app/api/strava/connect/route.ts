import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabaseServer } from "@/lib/supabase/server";
import { stravaAuthorizeUrl } from "@/lib/strava";

const STATE_COOKIE = "strava_oauth_state";

export async function GET(req: Request) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/auth/signin?next=/profile", req.url));
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "STRAVA_CLIENT_ID not configured" },
      { status: 500 },
    );
  }

  const state = randomBytes(24).toString("hex");
  const redirectUri = new URL("/api/strava/callback", req.url).toString();
  const authUrl = stravaAuthorizeUrl({ clientId, redirectUri, state });

  const res = NextResponse.redirect(authUrl);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 min
  });
  return res;
}
