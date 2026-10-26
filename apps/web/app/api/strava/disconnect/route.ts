import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { deleteConnection } from "@/lib/strava-sync";

export async function POST(_req: Request) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  await deleteConnection(supabase, user.id);
  return NextResponse.json({ ok: true });
}
