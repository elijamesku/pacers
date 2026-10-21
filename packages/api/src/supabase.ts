import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  // Optional: pass a platform-specific storage adapter (AsyncStorage on
  // mobile, cookies on web via @supabase/ssr). Defaults to browser
  // localStorage when running in a browser context.
  storage?: unknown;
  autoRefreshToken?: boolean;
  persistSession?: boolean;
  detectSessionInUrl?: boolean;
}

export function createSupabase(config: SupabaseConfig): SupabaseClient {
  return createClient(config.url, config.anonKey, {
    auth: {
      storage: config.storage as never,
      autoRefreshToken: config.autoRefreshToken ?? true,
      persistSession: config.persistSession ?? true,
      detectSessionInUrl: config.detectSessionInUrl ?? true,
    },
  });
}

// Web (apps/web) wraps this in a Next.js cookie-bound client via @supabase/ssr.
// Mobile (apps/mobile) wraps this with Expo SecureStore + AsyncStorage.
// Shared query/mutation helpers that work on both platforms live here too.

export type { SupabaseClient };
