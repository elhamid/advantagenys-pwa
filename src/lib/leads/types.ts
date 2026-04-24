/**
 * Lead types and source constants for the Advantage PWA → AOS pipeline.
 */

export const LEAD_SOURCES = [
  "website-contact-form",
  "website-booking",
  "advantagenys.com_book_appointment",
  "chat-widget",
  "kiosk",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

/**
 * Base fields shared by all lead types.
 */
export interface BaseLead {
  fullName: string;
  phone: string;
  email?: string;
  source: LeadSource;
}

/**
 * Contact / enquiry lead (Send Message form).
 */
export interface ContactLead extends BaseLead {
  type: "contact";
  businessType?: string;
  services?: string[];
  message?: string;
}

/**
 * Booking appointment lead.
 *
 * New fields (Phase 0+):
 *   - wantsAppointment: always true when submitted via book-appointment CTA
 *   - preferredWindow: e.g. ["Mornings", "Weekends"]
 *
 * @deprecated preferredDate — use preferredWindow instead
 * @deprecated preferredTime — use preferredWindow instead
 * Both are kept for back-compat so existing CRM rows still validate.
 */
export interface BookingLead extends BaseLead {
  type: "booking";
  serviceType?: string;
  wantsAppointment?: boolean;
  preferredWindow?: string[]; // e.g. ["Mornings", "Weekends"]
  /** @deprecated Use preferredWindow instead */
  preferredDate?: string;
  /** @deprecated Use preferredWindow instead */
  preferredTime?: string;
  description?: string;
}

export type Lead = ContactLead | BookingLead;
