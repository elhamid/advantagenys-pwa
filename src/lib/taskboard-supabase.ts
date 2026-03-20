import { createClient } from "@supabase/supabase-js";

const url = process.env.TASKBOARD_SUPABASE_URL;
const key = process.env.TASKBOARD_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn("[Taskboard] Missing TASKBOARD_SUPABASE_URL or TASKBOARD_SUPABASE_ANON_KEY");
}

export const taskboardSupabase = url && key ? createClient(url, key) : null;
