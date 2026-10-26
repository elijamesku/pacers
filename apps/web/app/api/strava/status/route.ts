import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { fetchConnection } from "@/lib/strava-sync";

export async function GET() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }
  const conn = await fetchConnection(supabase, user.id);
  if (!conn) return NextResponse.json({ connected: false });
  return NextResponse.json({
    connected: true,
    athleteId: conn.athlete_id,
    lastSyncedAt: conn.last_synced_at,
    scope: conn.scope,
  });
}
