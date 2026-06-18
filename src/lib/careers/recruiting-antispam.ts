import { createHash } from "node:crypto";

/**
 * Deterministic anti-spam guards for the recruiting funnel.
 *
 * The public application link is shared (one permanent link per role), so the
 * candidate-facing gate is gone. These guards keep the intake honest WITHOUT
 * blocking a legitimate candidate who arrives via the shared link:
 *   - HONEYPOT: a hidden field a human never fills. Bots that auto-fill all
 *     inputs trip it. Hard reject.
 *   - DUPLICATE: a stable hash of normalized email+phone. Exact re-submissions
 *     are flagged/rejected. Hard reject only on an exact dupe.
 *   - DEAD-LINK: best-effort HEAD check on candidate-provided artifact/resume
 *     URLs with a short timeout. A failed/unreachable URL is reported as a soft
 *     signal — it does NOT hard-reject (network flakiness must not lose a real
 *     candidate); only obviously dead links lower the score.
 *   - DISPOSABLE EMAIL: a small built-in blocklist of throwaway domains.
 *
 * None of these inspect the `ref` query param or the page route, so the shared
 * `?ref=...` link keeps working unchanged.
 */

// Small, conservative built-in list of disposable / throwaway email domains.
// Intentionally short — false positives would block real candidates. Extend
// deliberately, not exhaustively.
export const DISPOSABLE_EMAIL_DOMAINS = new Set<string>([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.info",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "throwawaymail.com",
  "yopmail.com",
  "trashmail.com",
  "getnada.com",
  "dispostable.com",
  "fakeinbox.com",
  "sharklasers.com",
  "maildrop.cc",
  "mailnesia.com",
  "discard.email",
  "spam4.me",
  "mohmal.com",
]);

export function emailDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 0) return null;
  const domain = email.slice(at + 1).trim().toLowerCase();
  return domain.length > 0 ? domain : null;
}

export function isDisposableEmail(email: string): boolean {
  const domain = emailDomain(email);
  if (!domain) return false;
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

/**
 * Stable dedupe key from normalized email + phone. Phone is reduced to digits
 * (last 10 to absorb country-code prefix variance); email is lowercased/trimmed.
 */
export function applicantFingerprint(email: string, phone: string): string {
  const normEmail = email.trim().toLowerCase();
  const digits = phone.replace(/\D/g, "");
  const normPhone = digits.length > 10 ? digits.slice(-10) : digits;
  return createHash("sha256").update(`${normEmail}|${normPhone}`).digest("hex");
}

export interface HoneypotResult {
  tripped: boolean;
}

/**
 * The honeypot field is hidden from humans via CSS/aria; any non-empty value
 * means an automated agent filled it. Field name is intentionally plausible
 * ("company_website") so naive bots target it.
 */
export const HONEYPOT_FIELD = "company_website";

export function checkHoneypot(value: string | null | undefined): HoneypotResult {
  return { tripped: typeof value === "string" && value.trim().length > 0 };
}

export interface DeadLinkResult {
  url: string;
  reachable: boolean;
  status?: number;
  checked: boolean;
}

/**
 * Best-effort reachability check. Returns reachable=true on any non-error
 * response (including 3xx/401/403 — many file hosts gate HEAD but the link is
 * real). Only network failure / 404 / 410 / explicit timeout count as
 * unreachable. Never throws.
 */
export async function checkUrlReachable(
  url: string,
  timeoutMs = 3500
): Promise<DeadLinkResult> {
  if (!/^https?:\/\//i.test(url)) {
    return { url, reachable: false, checked: false };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response: Response;
    try {
      response = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: controller.signal,
      });
    } catch {
      // Some hosts reject HEAD; retry once with GET (range-limited).
      response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { Range: "bytes=0-0" },
      });
    }

    const status = response.status;
    // Treat only hard "gone" statuses as unreachable. Auth/forbidden/method
    // errors still indicate the resource exists.
    const dead = status === 404 || status === 410;
    return { url, reachable: !dead, status, checked: true };
  } catch {
    // Network error or timeout — soft signal only; could not verify.
    return { url, reachable: false, checked: true };
  } finally {
    clearTimeout(timer);
  }
}
