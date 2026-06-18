/**
 * Typed analytics event helpers.
 *
 * Every helper:
 *   1. Pushes a normalized event to window.dataLayer (GTM consumer)
 *   2. Mirrors to gtag() if GA4 is configured (for direct GA4 integrations)
 *   3. Mirrors to fbq() if Meta Pixel is configured
 *
 * All calls are safe on the server — they no-op when `window` is undefined.
 * Keep this file import-free so it tree-shakes into any client component.
 */

export type LeadType =
  | "contact"
  | "booking"
  | "client-info"
  | "corporate-registration"
  | "insurance"
  | "home-improvement";

type AnyPayload = Record<string, unknown>;

type DataLayerWindow = typeof globalThis & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
};

function getWin(): DataLayerWindow | null {
  if (typeof window === "undefined") return null;
  return window as DataLayerWindow;
}

function push(event: string, payload: AnyPayload = {}) {
  const w = getWin();
  if (!w) return;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...payload });
}

function gtag(event: string, payload: AnyPayload = {}) {
  const w = getWin();
  if (!w || typeof w.gtag !== "function") return;
  w.gtag("event", event, payload);
}

function fbq(event: string, payload: AnyPayload = {}) {
  const w = getWin();
  if (!w || typeof w.fbq !== "function") return;
  // Meta Pixel standard events
  w.fbq("track", event, payload);
}

// ---------------------------------------------------------------------------
// Page view — fire on route changes (layout/template hook can call this).
// ---------------------------------------------------------------------------

export function pageView(path: string) {
  push("page_view", { page_path: path });
  gtag("page_view", { page_path: path });
}

// ---------------------------------------------------------------------------
// Lead / form funnel
// ---------------------------------------------------------------------------

export function formStart(leadType: LeadType) {
  push("form_start", { lead_type: leadType });
  gtag("form_start", { lead_type: leadType });
  fbq("InitiateCheckout", { content_category: leadType });
}

export function formSubmit(leadType: LeadType, value?: number) {
  push("form_submit", { lead_type: leadType, value });
  gtag("generate_lead", { lead_type: leadType, value });
  fbq("Lead", { content_category: leadType, value });
}

export function bookingSubmit() {
  push("booking_submit");
  gtag("generate_lead", { lead_type: "booking" });
  fbq("Schedule");
}

// ---------------------------------------------------------------------------
// Book-Appointment card / trigger events
// ---------------------------------------------------------------------------

/** Fired when the user clicks the primary "Book an appointment" card to expand it. */
export function bookingTriggerOpen(): void {
  push("booking_trigger_open");
  gtag("booking_trigger_open");
}

/** Fired in redirect mode when the user clicks to go to the AOS booking page. */
export function bookingRedirectClick(service: string): void {
  push("booking_redirect_click", { service });
  gtag("booking_redirect_click", { service });
}

/** Fired in iframe mode when the AOS booking modal opens. */
export function bookingIframeOpen(service: string): void {
  push("booking_iframe_open", { service });
  gtag("booking_iframe_open", { service });
}

/**
 * Fired in iframe mode when the AOS booking iframe posts a confirmation message
 * and the modal closes with a confirmed booking.
 */
export function bookingIframeConfirmed(bookingId: string): void {
  push("booking_iframe_confirmed", { booking_id: bookingId });
  gtag("booking_iframe_confirmed", { booking_id: bookingId });
}

// ---------------------------------------------------------------------------
// ITIN kiosk
// ---------------------------------------------------------------------------

export function itinApplyStart() {
  push("itin_apply_start");
  gtag("itin_apply_start");
  fbq("InitiateCheckout", { content_category: "itin" });
}

export function itinApplySubmit() {
  push("itin_apply_submit");
  gtag("generate_lead", { lead_type: "itin" });
  fbq("Lead", { content_category: "itin" });
}

// ---------------------------------------------------------------------------
// Lead qualifier (stub for future use)
// ---------------------------------------------------------------------------

export function qualifierStart() {
  push("qualifier_start");
}

export type QualifierVerdict = "ready" | "almost" | "not_yet";
export function qualifierVerdict(verdict: QualifierVerdict) {
  push("qualifier_verdict", { verdict });
}

// ---------------------------------------------------------------------------
// Tools
// ---------------------------------------------------------------------------

export function toolComplete(tool: string) {
  push("tool_complete", { tool });
  gtag("tool_complete", { tool });
}

// ---------------------------------------------------------------------------
// Contact methods
// ---------------------------------------------------------------------------

export function phoneClick() {
  push("phone_click");
  gtag("phone_click");
  fbq("Contact");
}

export function whatsappClick() {
  push("whatsapp_click");
  gtag("whatsapp_click");
  fbq("Contact");
}

// ---------------------------------------------------------------------------
// Chat widget
// ---------------------------------------------------------------------------

export function chatOpen() {
  push("chat_open");
  gtag("chat_open");
}

export function chatMessageSent() {
  push("chat_message_sent");
  gtag("chat_message_sent");
}

// ---------------------------------------------------------------------------
// Outbound link
// ---------------------------------------------------------------------------

export function outboundClick(href: string) {
  push("outbound_click", { href });
  gtag("outbound_click", { href });
}
