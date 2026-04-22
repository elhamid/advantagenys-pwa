/**
 * Shared in-memory IP-based rate limiter.
 *
 * Uses a sliding window of timestamps per IP. Bounded LRU-style cleanup
 * keeps memory usage stable across long-running instances.
 *
 * No external dependencies — persists only within the running Node/Edge
 * process. Vercel cold starts reset counters. Best-effort throttling.
 */

export interface RateLimiter {
  /** Maximum number of hits allowed per window. */
  readonly max: number;
  /** Size of the sliding window in milliseconds. */
  readonly windowMs: number;
  /** Human-readable label used in log lines. */
  readonly label: string;
  /**
   * Register a hit for this IP. Returns `true` if the IP has exceeded its
   * quota and the request should be rejected.
   */
  isLimited(ip: string): boolean;
  /** Remaining hits available in the current window. */
  remaining(ip: string): number;
  /** Clear all tracked IPs (primarily for tests). */
  reset(): void;
}

interface RateLimiterOptions {
  /** Maximum LRU entries retained; older IPs are evicted beyond this. */
  maxEntries?: number;
  /** Friendly label used for logs. Defaults to `"rate-limit"`. */
  label?: string;
}

const DEFAULT_MAX_ENTRIES = 10_000;

/**
 * Create a sliding-window rate limiter.
 *
 * @param max Maximum number of hits allowed per window.
 * @param windowMs Window size in milliseconds.
 * @param options Optional label + LRU cap.
 */
export function createRateLimiter(
  max: number,
  windowMs = 60_000,
  options: RateLimiterOptions = {}
): RateLimiter {
  const maxEntries = options.maxEntries ?? DEFAULT_MAX_ENTRIES;
  const label = options.label ?? "rate-limit";
  const map = new Map<string, number[]>();

  function pruneOld(ip: string): number[] {
    const now = Date.now();
    const timestamps = map.get(ip) || [];
    return timestamps.filter((t) => now - t < windowMs);
  }

  function evictIfFull() {
    if (map.size <= maxEntries) return;
    // Evict the oldest insertion (Map iteration order = insertion order).
    const oldest = map.keys().next().value;
    if (oldest !== undefined) map.delete(oldest);
  }

  return {
    max,
    windowMs,
    label,

    isLimited(ip: string): boolean {
      const recent = pruneOld(ip);
      if (recent.length >= max) {
        // Keep the pruned list so the window slides correctly.
        map.set(ip, recent);
        return true;
      }
      recent.push(Date.now());
      map.delete(ip);
      map.set(ip, recent);
      evictIfFull();
      return false;
    },

    remaining(ip: string): number {
      return Math.max(0, max - pruneOld(ip).length);
    },

    reset(): void {
      map.clear();
    },
  };
}

/**
 * Best-effort client-IP extractor for Next.js route handlers.
 * Respects `x-forwarded-for` (first hop) and `x-real-ip`.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
