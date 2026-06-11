export interface RateLimiter {
  readonly max: number;
  readonly windowMs: number;
  readonly label: string;
  isLimited(ip: string): boolean;
  remaining(ip: string): number;
  reset(): void;
}

interface RateLimiterOptions {
  maxEntries?: number;
  label?: string;
}

const DEFAULT_MAX_ENTRIES = 10_000;

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
    return timestamps.filter((timestamp) => now - timestamp < windowMs);
  }

  function evictIfFull() {
    if (map.size <= maxEntries) return;
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
