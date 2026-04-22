// Chat Security — rate limiting, prompt injection detection, input sanitization
// Ported from WisePal security.ts, adapted for App Router (no req/res objects).

// ============================================================================
// HTML Sanitization
// ============================================================================

const TAG_BLOCK_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
] as const;

/**
 * Strip HTML tags, control characters, trim, and cap at 500 chars.
 */
export function sanitizeInput(input: string): string {
  let sanitized = input;

  for (const pattern of TAG_BLOCK_PATTERNS) {
    sanitized = sanitized.replace(pattern, " ");
  }

  return (
    sanitized
      // Remove remaining HTML tags
      .replace(/<[^>]*>/g, " ")
      // Strip control characters (keep newlines and tabs)
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 500)
  );
}

// ============================================================================
// Prompt Injection Detection
// ============================================================================

const PROMPT_INJECTION_PATTERNS = [
  /\bignore\s+(all\s+|any\s+|the\s+)?previous\b/i,
  /\byou\s+are\s+now\b/i,
  /^\s*system\s*:/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /\bdeveloper\s+message\b/i,
  /\boverride\s+(all\s+|the\s+)?instructions\b/i,
] as const;

export function containsPromptInjection(input: string): boolean {
  return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

// ============================================================================
// Rate Limiter — re-export from shared helper
// ============================================================================
// Historically the chat route created its own in-memory limiter here. The
// launch-readiness audit consolidated all limiters onto `src/lib/rate-limit.ts`
// for consistency. This re-export preserves the chat-route import surface.

export { createRateLimiter } from "@/lib/rate-limit";
export type { RateLimiter } from "@/lib/rate-limit";
