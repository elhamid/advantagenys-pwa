import { CONTACT_PHONE_DISPLAY, CONTACT_EMAIL } from "./contact-info";

/**
 * User-facing fallback message appended to form errors.
 * Gives the user a way to reach the business even when the form is broken.
 */
export const FORM_ERROR_FALLBACK = `If this issue persists, please call us at ${CONTACT_PHONE_DISPLAY} or email ${CONTACT_EMAIL}.`;

/**
 * Build a user-facing error message that includes the contact fallback.
 */
export function userFacingFormError(err: unknown): string {
  const base =
    err instanceof Error && err.message
      ? err.message
      : "Something went wrong. Please try again.";
  return `${base} ${FORM_ERROR_FALLBACK}`;
}

/**
 * Fire-and-forget error report to /api/form-errors.
 * Also logs to console.error for local dev visibility.
 * Never throws -- swallows all secondary errors so the user flow is not interrupted.
 */
export function reportFormError(
  formType: string,
  error: unknown,
  formData?: Record<string, unknown>
): void {
  const message =
    error instanceof Error ? error.message : String(error);
  const stack =
    error instanceof Error ? error.stack : undefined;

  // Always log locally
  console.error(`[FORM ERROR] ${formType}:`, { message, stack, formData });

  // Fire-and-forget POST -- intentionally no await, no .catch that rethrows
  try {
    // Strip PII fields (SSN, ITIN, password) from the snapshot before sending
    const safeData = formData ? sanitizeForReport(formData) : undefined;

    fetch("/api/form-errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formType,
        message: message.slice(0, 1000),
        stack: stack?.slice(0, 2000),
        url: typeof window !== "undefined" ? window.location.href : undefined,
        formData: safeData,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Swallow -- the error report itself failing must never surface to the user
    });
  } catch {
    // Swallow
  }
}

/** Remove PII-sensitive keys from the form data snapshot */
function sanitizeForReport(
  data: Record<string, unknown>
): Record<string, unknown> {
  const PII_KEYS = ["ssnOrItin", "ssn", "itin", "password", "ssnLast4"];
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (PII_KEYS.includes(key)) {
      safe[key] = "[REDACTED]";
    } else {
      safe[key] = value;
    }
  }
  return safe;
}
