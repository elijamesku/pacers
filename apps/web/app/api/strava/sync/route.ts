import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { syncActivities } from "@/lib/strava-sync";

export async function POST(_req: Request) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  try {
    const result = await syncActivities(supabase, user.id);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "sync failed" },
      { status: 500 },
    );
  }
}
