/**
 * AOS (Advantage Operating System) booking integration helpers.
 *
 * Phase 0: BOOKING_MODE === "form" — inline BookingForm (default)
 * Phase 1: BOOKING_MODE === "redirect" — sends user to AOS booking page
 * Phase 1: BOOKING_MODE === "iframe" — opens AOS booking page in a modal iframe
 *
 * Switch modes via NEXT_PUBLIC_AOS_BOOKING_MODE env var.
 * Default base URL: https://app.advantagenys.com/book
 */

export type BookingMode = "form" | "redirect" | "iframe";

export const BOOKING_MODE: BookingMode =
  (process.env.NEXT_PUBLIC_AOS_BOOKING_MODE as BookingMode) || "form";

const AOS_BASE =
  process.env.NEXT_PUBLIC_AOS_BOOKING_BASE_URL || "https://app.advantagenys.com/book";

const SERVICE_TO_SLUG: Record<string, string> = {
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
  try {
    return new URL(AOS_BASE).origin;
  } catch {
    return "https://app.advantagenys.com";
  }
})();
