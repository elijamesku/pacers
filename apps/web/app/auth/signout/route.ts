import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  const url = new URL("/auth/signin", req.url);
  return NextResponse.redirect(url, { status: 302 });
}

// Convenience: GET also signs out (so a plain <a> link works).
export const GET = POST;
