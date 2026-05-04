// System Prompt — fetches Ava's system prompt from taskboard DB with web-specific additions.
// Caches for 5 minutes. Falls back to hardcoded default if DB fetch fails.

import { taskboardSupabase } from "@/lib/taskboard-supabase";

// ============================================================================
// Cache
// ============================================================================

let _cached: { prompt: string; loadedAt: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// Fallback prompt
// ============================================================================

const DEFAULT_SYSTEM_PROMPT = `You are Ava, the AI assistant for Advantage Business Consulting.

You help visitors learn about our services:
- Tax Services (tax preparation, ITIN, sales tax, payroll tax)
- Business Formation (LLC, Corporation, DBA)
- Licensing & Permits
- Insurance (general liability, workers comp, commercial auto)
- Bookkeeping & Financial Services
- Immigration & Legal Services (immigration, citizenship, divorce, ITIN applications)
- Audit Defense

We serve restaurants, contractors, and immigrant entrepreneurs in New York.
Office: 229 Empire Blvd, Brooklyn, NY 11225
Phone: (929) 933-1396
Hours: Mon-Sat 10AM-7PM`;

// ============================================================================
// Fetch from DB
// ============================================================================

async function fetchBasePrompt(): Promise<string> {
  if (_cached && Date.now() - _cached.loadedAt < CACHE_TTL) {
    return _cached.prompt;
  }

  if (!taskboardSupabase) {
    return DEFAULT_SYSTEM_PROMPT;
  }

  try {
    const { data, error } = await taskboardSupabase
      .from("system_settings")
      .select("value")
      .eq("key", "bot_system_prompt")
      .single();

    if (error || !data?.value) {
      console.warn("[system-prompt] DB fetch failed, using fallback:", error?.message);
      return DEFAULT_SYSTEM_PROMPT;
    }

    const prompt = typeof data.value === "string" ? data.value : String(data.value);
    _cached = { prompt, loadedAt: Date.now() };
    return prompt;
  } catch (err) {
    console.error("[system-prompt] Unexpected error:", err);
    return DEFAULT_SYSTEM_PROMPT;
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Build the full system prompt with web-specific context additions.
 */
export async function getSystemPrompt(pageContext?: string): Promise<string> {
  const base = await fetchBasePrompt();

  const webAdditions = [
    "You are responding on the Advantage Services website at advantagenys.com.",
    pageContext ? `The visitor is currently viewing: ${pageContext}` : null,
    "Keep responses concise (2-3 sentences max). Use **bold** for key terms.",
    "When the visitor seems ready to take action, suggest booking a consultation at /contact or calling (929) 933-1396.",
    "Never share form links in the first 2 messages.",
    "Do not include phone numbers, email addresses, or office address in your responses. Contact options are already displayed in the chat interface.",
    "Reply in the language the visitor writes in.",
  ]
    .filter(Boolean)
    .join("\n");

  return `${base}\n\n${webAdditions}`;
}
