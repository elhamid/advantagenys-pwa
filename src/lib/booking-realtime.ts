/**
 * Browser-safe Supabase client for booking realtime subscriptions.
 *
 * Uses NEXT_PUBLIC_* env vars (anon key only — no service role).
 * Realtime requires the anon role to have SELECT on the `bookings` table
 * in taskboard's Supabase project. If RLS blocks anon reads, realtime events
 * will not fire and SlotGrid falls back to 15s polling.
 *
 * Env vars (add to .env.local and Vercel environment):
 *   NEXT_PUBLIC_TASKBOARD_SUPABASE_URL  — taskboard's Supabase project URL
 *   NEXT_PUBLIC_TASKBOARD_SUPABASE_ANON_KEY — taskboard's anon public key
 *
 * If either var is absent the export is null and callers must use polling.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_TASKBOARD_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_TASKBOARD_SUPABASE_ANON_KEY;

/**
 * Anon Supabase client targeting taskboard's DB.
 * null when env vars are absent — callers degrade gracefully to polling.
 */
export const bookingSupabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          // No auth session needed — pure realtime listener
          autoRefreshToken: false,
          persistSession: false,
        },
        realtime: {
          params: { eventsPerSecond: 10 },
        },
      })
    : null;

export type { SupabaseClient };
