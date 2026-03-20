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
// Rate Limiter Factory
// ============================================================================
// In-memory — resets on Vercel cold starts. Best-effort throttling.

export interface RateLimiter {
  readonly max: number;
  readonly windowMs: number;
  isLimited: (ip: string) => boolean;
  remaining: (ip: string) => number;
}

export function createRateLimiter(
  max: number,
  windowMs = 60_000
): RateLimiter {
  const map = new Map<string, number[]>();

  function getRecent(ip: string): number[] {
    const now = Date.now();
    const timestamps = map.get(ip) || [];
    return timestamps.filter((t) => now - t < windowMs);
  }

  // Periodic cleanup every 5 minutes
  const interval = setInterval(() => {
    for (const [ip] of map.entries()) {
      const recent = getRecent(ip);
      if (recent.length === 0) {
        map.delete(ip);
      } else {
        map.set(ip, recent);
      }
    }
  }, 300_000);
  if (typeof interval === "object" && "unref" in interval) {
    interval.unref();
  }

  return {
    max,
    windowMs,

    isLimited(ip: string): boolean {
      const recent = getRecent(ip);
      if (recent.length >= max) {
        map.set(ip, recent);
        return true;
      }
      recent.push(Date.now());
      map.set(ip, recent);
      return false;
    },

    remaining(ip: string): number {
      return Math.max(0, max - getRecent(ip).length);
    },
  };
}
