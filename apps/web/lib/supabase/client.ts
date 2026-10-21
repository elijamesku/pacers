"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Singleton — @supabase/ssr returns the same instance on repeat calls given
// the same URL + key.
let _client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to apps/web/.env.local.",
    );
  }
  _client = createBrowserClient(url, key);
  return _client;
}
