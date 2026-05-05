/**
 * Shared lead-submission types.
 *
 * Both client-side intake forms and the `/api/contact` server route import
 * from this file so the compiler catches any drift between payload shape and
 * server validation.
 */

// ---------------------------------------------------------------------------
// Attribution
// ---------------------------------------------------------------------------

/**
 * Allowlist of valid `source` values the API will forward verbatim to the
 * taskboard webhook. Anything outside this list is rejected.
 *
 * Keep in sync with the taskboard side (`contact_profiles.tags[]` uses this).
 */
export const LEAD_SOURCES = [
  "website-contact-form",
  "website-booking",
  "advantagenys.com_book_appointment",
  "website-client-info",
  "website-corporate-registration",
  "website-insurance",
  "website-home-improvement",
  "contractor-qualifier",
  "tool-tax-savings",
  "tool-itin-eligibility",
  "tool-biz-readiness",
  "pwa-kiosk",
  "chat-widget",
  "itin-kiosk",
  "advantagenys.com_book_page",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
}

// ---------------------------------------------------------------------------
// Base + variants
// ---------------------------------------------------------------------------

export interface LeadSubmissionBase {
  /** Full legal name of the person submitting. */
  fullName: string;
  phone: string;
  email?: string;
  /** Origin of the submission; forwarded to taskboard as-is. */
  source: LeadSource;
  /** Attribution metadata captured at form mount time. */
  utm?: UtmParams;
  /** Cloudflare Turnstile token, when the form surfaces the widget. */
  turnstileToken?: string;
}

export interface ContactLead extends LeadSubmissionBase {
  type: "contact";
  businessType?: string;
  services?: string[];
  message?: string;
}

export interface BookingLead extends LeadSubmissionBase {
  type: "booking";
  serviceType?: string;
  /**
   * @deprecated Use `preferredWindow` instead. Kept for back-compat with older form submissions.
   */
  preferredDate?: string;
  /**
   * @deprecated Use `preferredWindow` instead. Kept for back-compat with older form submissions.
   */
  preferredTime?: string;
  description?: string;
  /** Whether the lead explicitly wants an appointment (used by new book-appointment flow). */
  wantsAppointment?: boolean;
  /** Multi-select preferred time windows: e.g. ["Mornings", "Evenings"]. */
  preferredWindow?: string[];
  /** The `message` field is unused for bookings; keep for webhook parity. */
  message?: string;
}

export interface ClientInfoLead extends LeadSubmissionBase {
  type: "client-info";
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  ssnOrItin?: string;
  businessName?: string;
  serviceInterested?: string;
  referralSource?: string;
  additionalNotes?: string;
}

export interface CorporateRegistrationLead extends LeadSubmissionBase {
  type: "corporate-registration";
  desiredBusinessName?: string;
  businessType?: string;
  businessAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  natureOfBusiness?: string;
  numberOfMembers?: string;
  needEIN?: string;
  needSalesTax?: string;
  needPayroll?: string;
  additionalNotes?: string;
}

export interface InsuranceLead extends LeadSubmissionBase {
  type: "insurance";
  businessName?: string;
  businessType?: string;
  businessAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  industryTrade?: string;
  numberOfEmployees?: string;
  annualRevenue?: string;
  insuranceTypesNeeded?: string[];
  currentProvider?: string;
  policyExpiration?: string;
  notes?: string;
}

export interface HomeImprovementLead extends LeadSubmissionBase {
  type: "home-improvement";
  businessName?: string;
  businessAddress?: string;
  city?: string;
  county?: string;
  state?: string;
  zipCode?: string;
  licenseType?: string;
  hasExistingLicense?: string;
  licenseNumber?: string;
  additionalNotes?: string;
}

export interface ContractorQualifierLead extends LeadSubmissionBase {
  type: "contractor-qualifier";
  /** Step 1: NYC 5 boroughs / Nassau / Suffolk / Westchester / Rockland / Putnam / multiple */
  workLocation?: string;
  /** Step 2: HIC / GC / both */
  scopeOfWork?: string;
  /** Step 3: none / sole-prop / llc / corp */
  entityStatus?: string;
  /** Step 4: <1yr / 1-4yr / 5+yr */
  experience?: string;
  /** Step 5: multi-select — epa-rrp / epa-lead / insurance / none */
  certifications?: string[];
  /** Step 6: waiting / 30days / exploring */
  timeline?: string;
  /** Computed verdict: ready / almost / not-yet */
  verdict?: string;
  /** Preferred language for outreach */
  preferredLanguage?: string;
}

/**
 * Discriminated union — use `lead.type` to narrow.
 */
export type LeadSubmission =
  | ContactLead
  | BookingLead
  | ClientInfoLead
  | CorporateRegistrationLead
  | InsuranceLead
  | HomeImprovementLead
  | ContractorQualifierLead;

export type LeadType = LeadSubmission["type"];

export const LEAD_TYPES: LeadType[] = [
  "contact",
  "booking",
  "client-info",
  "corporate-registration",
  "insurance",
  "home-improvement",
  "contractor-qualifier",
];
