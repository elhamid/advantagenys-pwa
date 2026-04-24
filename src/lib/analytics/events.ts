/**
 * Analytics event helpers for the Advantage PWA.
 *
 * Wraps window.gtag / window.dataLayer calls so components
 * never touch the GA layer directly. All functions are no-ops
 * in environments where the analytics script is not loaded.
 */

type Gtag = (...args: unknown[]) => void;

function track(event: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  // Google Analytics 4 via gtag
  const w = window as unknown as { gtag?: Gtag };
  if (typeof w.gtag === "function") {
    w.gtag("event", event, params ?? {});
  }
}

// ---------------------------------------------------------------------------
// Contact / message form events
// ---------------------------------------------------------------------------

/** Fired when the user submits the Send-a-Message form successfully. */
export function messageSubmit(): void {
  track("contact_message_submit");
}

// ---------------------------------------------------------------------------
// Booking form events (form-mode, Phase 0)
// ---------------------------------------------------------------------------

/** Fired when the user submits the booking form in form mode successfully. */
export function bookingSubmit(): void {
  track("booking_form_submit");
}

// ---------------------------------------------------------------------------
// Book-Appointment card / trigger events
// ---------------------------------------------------------------------------

/** Fired when the user clicks the primary "Book an appointment" card to expand it. */
export function bookingTriggerOpen(): void {
  track("booking_trigger_open");
}

/** Fired in redirect mode when the user clicks to go to the AOS booking page. */
export function bookingRedirectClick(service: string): void {
  track("booking_redirect_click", { service });
}

/** Fired in iframe mode when the AOS booking modal opens. */
export function bookingIframeOpen(service: string): void {
  track("booking_iframe_open", { service });
}

/**
 * Fired in iframe mode when the AOS booking iframe posts a confirmation message
 * and the modal closes with a confirmed booking.
 */
export function bookingIframeConfirmed(bookingId: string): void {
  track("booking_iframe_confirmed", { booking_id: bookingId });
}
