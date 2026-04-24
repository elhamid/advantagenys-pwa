/**
 * AOS (Advantage Operating System) booking integration helpers.
 *
 * Phase 0: BOOKING_MODE === "form" — inline BookingForm (default)
 * Phase 1: BOOKING_MODE === "redirect" — sends user to AOS booking page
 * Phase 1: BOOKING_MODE === "iframe" — opens AOS booking page in a modal iframe
 *
 * Switch modes via NEXT_PUBLIC_AOS_BOOKING_MODE env var.
 * Set the base URL via NEXT_PUBLIC_AOS_BOOKING_BASE_URL (no default — missing URL
 * silently degrades redirect/iframe modes back to "form").
 */

export type BookingMode = "form" | "redirect" | "iframe";

const RAW_MODE = process.env.NEXT_PUBLIC_AOS_BOOKING_MODE as BookingMode | undefined;
const RAW_BASE = process.env.NEXT_PUBLIC_AOS_BOOKING_BASE_URL;

// Silently degrade to "form" if redirect/iframe mode is set but the base URL is missing.
export const BOOKING_MODE: BookingMode =
  RAW_MODE && (RAW_MODE === "redirect" || RAW_MODE === "iframe")
    ? RAW_BASE
      ? RAW_MODE
      : "form"
    : "form";

// Only used when BOOKING_MODE !== "form"
const AOS_BASE = RAW_BASE || "";

export const SERVICE_TO_SLUG: Record<string, string> = {
  Tax: "tax-consult",
  ITIN: "itin-intake",
  Formation: "formation-consult",
  Insurance: "insurance-consult",
  Consulting: "general-consult",
  Other: "general-consult",
};

export function buildBookingUrl(opts: {
  service?: string;
  embed?: boolean;
  prefillName?: string;
  prefillEmail?: string;
}): string {
  if (!AOS_BASE) {
    // Belt-and-suspenders: should never be called when BOOKING_MODE === "form",
    // but guard here to surface a clear dev error.
    throw new Error(
      "[aos-booking] buildBookingUrl called but NEXT_PUBLIC_AOS_BOOKING_BASE_URL is not set."
    );
  }
  const slug = SERVICE_TO_SLUG[opts.service ?? ""] ?? "general-consult";
  const params = new URLSearchParams();
  params.set("utm_source", "advantagenys.com_contact");
  if (opts.embed) params.set("embed", "1");
  if (opts.prefillName) params.set("prefill_name", opts.prefillName);
  if (opts.prefillEmail) params.set("prefill_email", opts.prefillEmail);
  if (opts.service) params.set("service", opts.service);
  return `${AOS_BASE}/${slug}?${params.toString()}`;
}

export const AOS_ORIGIN = (() => {
  if (!AOS_BASE) return "";
  try {
    return new URL(AOS_BASE).origin;
  } catch {
    return "";
  }
})();
