import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { exchangeCodeForTokens } from "@/lib/strava";
import {
  syncActivities,
  upsertConnectionFromTokens,
} from "@/lib/strava-sync";

const STATE_COOKIE = "strava_oauth_state";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const scope = url.searchParams.get("scope") ?? undefined;
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/profile?strava=denied&reason=${encodeURIComponent(error)}`, req.url),
    );
  }
  if (!code || !state) {
    return NextResponse.redirect(new URL("/profile?strava=error", req.url));
  }

  // Verify CSRF state cookie.
  const cookieHeader = req.headers.get("cookie") ?? "";
  const expected = cookieHeader
    .split("; ")
    .find((c) => c.startsWith(`${STATE_COOKIE}=`))
    ?.split("=")[1];
  if (!expected || expected !== state) {
    return NextResponse.redirect(new URL("/profile?strava=state", req.url));
  }

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/auth/signin?next=/profile", req.url));
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/profile?strava=notconfigured", req.url));
  }

  try {
    const tokens = await exchangeCodeForTokens({
      clientId,
      clientSecret,
      code,
      scope,
    });
    await upsertConnectionFromTokens(supabase, user.id, tokens);
    const sync = await syncActivities(supabase, user.id, { lookbackDays: 30 });
    const res = NextResponse.redirect(
      new URL(`/profile?strava=connected&imported=${sync.imported}`, req.url),
    );
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch (e) {
    return NextResponse.redirect(
      new URL(
        `/profile?strava=error&reason=${encodeURIComponent(
          e instanceof Error ? e.message : "unknown",
        )}`,
        req.url,
      ),
    );
  }
}
