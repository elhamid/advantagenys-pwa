import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";
import {
  LEAD_SOURCES,
  type AdditionalOwner,
  type LeadSource,
  type LeadSubmission,
  type UtmParams,
} from "@/lib/leads/types";
import { getClientIp } from "@/lib/rate-limit";
import { contactLimiter } from "./contact-limiter";

// Lazy-init Supabase client to avoid crashing if env vars aren't set yet
let supabaseClient: Awaited<typeof import("@/lib/supabase")>["supabase"] | null =
  null;

async function getSupabase() {
  if (supabaseClient) return supabaseClient;
  try {
    const { supabase } = await import("@/lib/supabase");
    supabaseClient = supabase;
    return supabase;
  } catch {
    console.warn("[Supabase] Client not available — env vars may be missing");
    return null;
  }
}

// ---------------------------------------------------------------------------
// Rate limiting — 10 submissions / minute / IP
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

type ValidationResult =
  | { valid: true; data: LeadSubmission }
  | { valid: false; error: string };

const VALID_SOURCES = new Set<string>(LEAD_SOURCES as readonly string[]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : undefined;
}

function strOrEmpty(v: unknown): string | undefined {
  // Returns a trimmed string even when trimmed length is 0 (treats empty as undefined).
  if (typeof v !== "string") return undefined;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function strArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const arr = v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  return arr.length > 0 ? arr : undefined;
}

function num(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function additionalOwnerArray(v: unknown): AdditionalOwner[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const owners = v
    .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry))
    .map((entry) => ({
      name: strOrEmpty(entry.name) ?? "",
      address: strOrEmpty(entry.address),
      city: strOrEmpty(entry.city),
      state: strOrEmpty(entry.state),
      zipCode: strOrEmpty(entry.zipCode),
      ssnOrItin: strOrEmpty(entry.ssnOrItin),
      dateOfBirth: strOrEmpty(entry.dateOfBirth),
      telephone: strOrEmpty(entry.telephone),
      cellPhone: strOrEmpty(entry.cellPhone),
      phone: strOrEmpty(entry.phone),
    }))
    .filter((owner) => Object.values(owner).some((value) => typeof value === "string" && value.trim()));

  return owners.length > 0 ? owners : undefined;
}

function maskSensitiveIdentifier(value: string): string {
  const compact = value.replace(/\D/g, "");
  const last4 = compact.slice(-4);
  return last4 ? `[sensitive ending ${last4}]` : "[sensitive provided]";
}

function upper(v: string | undefined): string | undefined {
  return v ? v.toLocaleUpperCase("en-US") : v;
}

function uppercaseOwner(owner: AdditionalOwner): AdditionalOwner {
  return {
    ...owner,
    name: upper(owner.name) ?? "",
    address: upper(owner.address),
    city: upper(owner.city),
    state: upper(owner.state),
    zipCode: owner.zipCode,
    ssnOrItin: upper(owner.ssnOrItin),
    telephone: owner.telephone,
    cellPhone: owner.cellPhone,
    phone: owner.phone,
  };
}

function normalizeGovernmentLead(data: LeadSubmission): LeadSubmission {
  if (data.type === "client-info") {
    return {
      ...data,
      fullName: upper(data.fullName) ?? data.fullName,
      address: upper(data.address),
      city: upper(data.city),
      state: upper(data.state),
      businessName: upper(data.businessName),
      serviceInterested: upper(data.serviceInterested),
      referredBy: upper(data.referredBy),
      purpose: upper(data.purpose),
      referralSource: upper(data.referralSource),
    };
  }

  if (data.type === "corporate-registration") {
    return {
      ...data,
      fullName: upper(data.fullName) ?? data.fullName,
      desiredBusinessName: upper(data.desiredBusinessName),
      businessType: upper(data.businessType),
      natureOfBusiness: upper(data.natureOfBusiness),
      ownerAddress: upper(data.ownerAddress),
      ownerCity: upper(data.ownerCity),
      ownerState: upper(data.ownerState),
      additionalOwners: data.additionalOwners?.map(uppercaseOwner),
      additionalOwner2Name: upper(data.additionalOwner2Name),
      additionalOwner2Address: upper(data.additionalOwner2Address),
      additionalOwner2City: upper(data.additionalOwner2City),
      additionalOwner2State: upper(data.additionalOwner2State),
      additionalOwner3Name: upper(data.additionalOwner3Name),
      additionalOwner3Address: upper(data.additionalOwner3Address),
      additionalOwner3City: upper(data.additionalOwner3City),
      additionalOwner3State: upper(data.additionalOwner3State),
      meetingPreference: upper(data.meetingPreference),
      corporationAddress: upper(data.corporationAddress),
      corporationCity: upper(data.corporationCity),
      corporationState: upper(data.corporationState),
      websiteSeoOptions: upper(data.websiteSeoOptions),
      needEIN: upper(data.needEIN),
      needSalesTax: upper(data.needSalesTax),
      needPayroll: upper(data.needPayroll),
      additionalNotes: upper(data.additionalNotes),
    };
  }

  return data;
}

function maskLeadForPwaStorage(data: LeadSubmission): LeadSubmission {
  if (data.type === "client-info" && data.ssnOrItin) {
    return {
      ...data,
      ssnOrItin: maskSensitiveIdentifier(data.ssnOrItin),
    };
  }

  if (data.type === "corporate-registration") {
    return {
      ...data,
      ownerSsnOrItin: data.ownerSsnOrItin ? maskSensitiveIdentifier(data.ownerSsnOrItin) : data.ownerSsnOrItin,
      additionalOwner2SsnOrItin: data.additionalOwner2SsnOrItin
        ? maskSensitiveIdentifier(data.additionalOwner2SsnOrItin)
        : data.additionalOwner2SsnOrItin,
      additionalOwner3SsnOrItin: data.additionalOwner3SsnOrItin
        ? maskSensitiveIdentifier(data.additionalOwner3SsnOrItin)
        : data.additionalOwner3SsnOrItin,
      additionalOwners: data.additionalOwners?.map((owner) => ({
        ...owner,
        ssnOrItin: owner.ssnOrItin ? maskSensitiveIdentifier(owner.ssnOrItin) : owner.ssnOrItin,
      })),
    };
  }

  return data;
}

function validateUtm(v: unknown): UtmParams | undefined {
  if (!v || typeof v !== "object") return undefined;
  const obj = v as Record<string, unknown>;
  const captured: UtmParams = {};
  const keys: (keyof UtmParams)[] = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "referrer",
  ];
  for (const k of keys) {
    const val = str(obj[k]);
    if (val) captured[k] = val.slice(0, 500);
  }
  return Object.keys(captured).length > 0 ? captured : undefined;
}

function validatePayload(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object." };
  }

  const obj = body as Record<string, unknown>;

  // --- Base fields ----------------------------------------------------------
  const fullName = str(obj.fullName);
  if (!fullName) return { valid: false, error: "Full name is required." };

  const phoneRaw = typeof obj.phone === "string" ? obj.phone.trim() : "";
  if (phoneRaw.length < 7) {
    return {
      valid: false,
      error: "A valid phone number is required (minimum 7 digits).",
    };
  }

  let email: string | undefined;
  if (obj.email !== undefined && obj.email !== "") {
    if (typeof obj.email !== "string" || !EMAIL_RE.test(obj.email)) {
      return { valid: false, error: "Invalid email address." };
    }
    email = obj.email.trim();
  }

  // --- Type discriminator ---------------------------------------------------
  const rawType = typeof obj.type === "string" ? obj.type : "contact";
  // Normalize known aliases to canonical type values.
  const typeAlias: Record<string, LeadSubmission["type"]> = {
    contact: "contact",
    booking: "booking",
    "client-info": "client-info",
    "corporate-registration": "corporate-registration",
    // Older CorporateRegistrationForm versions sent `type: "corporate"` or similar.
    corporate: "corporate-registration",
    insurance: "insurance",
    "home-improvement": "home-improvement",
    "contractor-qualifier": "contractor-qualifier",
  };
  const leadType = typeAlias[rawType];
  if (!leadType) {
    return { valid: false, error: `Unsupported submission type: ${rawType}` };
  }

  // --- Source (attribution) -------------------------------------------------
  const defaultSourceByType: Record<LeadSubmission["type"], LeadSource> = {
    contact: "website-contact-form",
    booking: "website-booking",
    "client-info": "website-client-info",
    "corporate-registration": "website-corporate-registration",
    insurance: "website-insurance",
    "home-improvement": "website-home-improvement",
    "contractor-qualifier": "contractor-qualifier",
  };

  let source: LeadSource = defaultSourceByType[leadType];
  const rawSource = typeof obj.source === "string" ? obj.source.trim() : undefined;
  if (rawSource) {
    if (!VALID_SOURCES.has(rawSource)) {
      return { valid: false, error: `Unknown source: ${rawSource}` };
    }
    source = rawSource as LeadSource;
  }

  const utm = validateUtm(obj.utm);
  const sharedBy = str(obj.sharedBy) ?? str(obj.shared_by);
  const formSendId = str(obj.formSendId) ?? str(obj.form_send_id) ?? str(obj.send_id);
  const turnstileToken = str(obj.turnstileToken);

  // --- Build variant --------------------------------------------------------
  const base = {
    fullName,
    phone: phoneRaw,
    email,
    source,
    sharedBy,
    formSendId,
    utm,
    turnstileToken,
  };

  switch (leadType) {
    case "contact": {
      const services = strArray(obj.services);
      return {
        valid: true,
        data: {
          ...base,
          type: "contact",
          businessType: strOrEmpty(obj.businessType),
          services,
          message: strOrEmpty(obj.message),
        },
      };
    }
    case "booking": {
      const wantsAppointmentRaw = obj.wantsAppointment;
      const wantsAppointment =
        typeof wantsAppointmentRaw === "boolean" ? wantsAppointmentRaw : undefined;
      return {
        valid: true,
        data: {
          ...base,
          type: "booking",
          serviceType: strOrEmpty(obj.serviceType),
          preferredDate: strOrEmpty(obj.preferredDate),
          preferredTime: strOrEmpty(obj.preferredTime),
          preferredWindow: strArray(obj.preferredWindow),
          wantsAppointment,
          description: strOrEmpty(obj.description),
          message: strOrEmpty(obj.message),
        },
      };
    }
    case "client-info": {
      return {
        valid: true,
        data: {
          ...base,
          type: "client-info",
          dateOfBirth: strOrEmpty(obj.dateOfBirth),
          address: strOrEmpty(obj.address),
          city: strOrEmpty(obj.city),
          state: strOrEmpty(obj.state),
          zipCode: strOrEmpty(obj.zipCode),
          ssnOrItin: strOrEmpty(obj.ssnOrItin),
          businessName: strOrEmpty(obj.businessName),
          serviceInterested: strOrEmpty(obj.serviceInterested),
          meetingPreference: strOrEmpty(obj.meetingPreference),
          referredBy: strOrEmpty(obj.referredBy),
          purpose: strOrEmpty(obj.purpose),
          referralSource: strOrEmpty(obj.referralSource),
          additionalNotes: strOrEmpty(obj.additionalNotes),
        },
      };
    }
    case "corporate-registration": {
      return {
        valid: true,
        data: {
          ...base,
          type: "corporate-registration",
          desiredBusinessName: strOrEmpty(obj.desiredBusinessName),
          businessType: strOrEmpty(obj.businessType),
          ein: strOrEmpty(obj.ein),
          filingReceiptDate: strOrEmpty(obj.filingReceiptDate),
          natureOfBusiness: strOrEmpty(obj.natureOfBusiness),
          ownerAddress: strOrEmpty(obj.ownerAddress),
          ownerCity: strOrEmpty(obj.ownerCity),
          ownerState: strOrEmpty(obj.ownerState),
          ownerZipCode: strOrEmpty(obj.ownerZipCode),
          ownerSsnOrItin: strOrEmpty(obj.ownerSsnOrItin),
          ownerDateOfBirth: strOrEmpty(obj.ownerDateOfBirth),
          ownerTelephone: strOrEmpty(obj.ownerTelephone),
          ownerCellPhone: strOrEmpty(obj.ownerCellPhone),
          numberOfMembers: strOrEmpty(obj.numberOfMembers),
          numberOfOwners: num(obj.numberOfOwners),
          additionalOwners: additionalOwnerArray(obj.additionalOwners),
          additionalOwner2Name: strOrEmpty(obj.additionalOwner2Name),
          additionalOwner2Address: strOrEmpty(obj.additionalOwner2Address),
          additionalOwner2City: strOrEmpty(obj.additionalOwner2City),
          additionalOwner2State: strOrEmpty(obj.additionalOwner2State),
          additionalOwner2ZipCode: strOrEmpty(obj.additionalOwner2ZipCode),
          additionalOwner2SsnOrItin: strOrEmpty(obj.additionalOwner2SsnOrItin),
          additionalOwner2DateOfBirth: strOrEmpty(obj.additionalOwner2DateOfBirth),
          additionalOwner2Telephone: strOrEmpty(obj.additionalOwner2Telephone),
          additionalOwner2CellPhone: strOrEmpty(obj.additionalOwner2CellPhone),
          additionalOwner3Name: strOrEmpty(obj.additionalOwner3Name),
          additionalOwner3Address: strOrEmpty(obj.additionalOwner3Address),
          additionalOwner3City: strOrEmpty(obj.additionalOwner3City),
          additionalOwner3State: strOrEmpty(obj.additionalOwner3State),
          additionalOwner3ZipCode: strOrEmpty(obj.additionalOwner3ZipCode),
          additionalOwner3SsnOrItin: strOrEmpty(obj.additionalOwner3SsnOrItin),
          additionalOwner3DateOfBirth: strOrEmpty(obj.additionalOwner3DateOfBirth),
          additionalOwner3Telephone: strOrEmpty(obj.additionalOwner3Telephone),
          additionalOwner3CellPhone: strOrEmpty(obj.additionalOwner3CellPhone),
          meetingPreference: strOrEmpty(obj.meetingPreference),
          corporationAddress: strOrEmpty(obj.corporationAddress),
          corporationCity: strOrEmpty(obj.corporationCity),
          corporationState: strOrEmpty(obj.corporationState),
          corporationZipCode: strOrEmpty(obj.corporationZipCode),
          websiteSeoOptions: strOrEmpty(obj.websiteSeoOptions),
          needEIN: strOrEmpty(obj.needEIN),
          needSalesTax: strOrEmpty(obj.needSalesTax),
          needPayroll: strOrEmpty(obj.needPayroll),
          additionalNotes: strOrEmpty(obj.additionalNotes),
        },
      };
    }
    case "insurance": {
      return {
        valid: true,
        data: {
          ...base,
          type: "insurance",
          businessName: strOrEmpty(obj.businessName),
          businessType: strOrEmpty(obj.businessType),
          businessAddress: strOrEmpty(obj.businessAddress),
          city: strOrEmpty(obj.city),
          state: strOrEmpty(obj.state),
          zipCode: strOrEmpty(obj.zipCode),
          industryTrade: strOrEmpty(obj.industryTrade),
          numberOfEmployees: strOrEmpty(obj.numberOfEmployees),
          amountToBeInsured: strOrEmpty(obj.amountToBeInsured),
          locationSquareFeet: strOrEmpty(obj.locationSquareFeet),
          estimatedYearlyPayroll: strOrEmpty(obj.estimatedYearlyPayroll),
          annualRevenue: strOrEmpty(obj.annualRevenue),
          insuranceTypesNeeded: strArray(obj.insuranceTypesNeeded),
          currentProvider: strOrEmpty(obj.currentProvider),
          policyExpiration: strOrEmpty(obj.policyExpiration),
          notes: strOrEmpty(obj.notes),
        },
      };
    }
    case "home-improvement": {
      return {
        valid: true,
        data: {
          ...base,
          type: "home-improvement",
          businessName: strOrEmpty(obj.businessName),
          businessAddress: strOrEmpty(obj.businessAddress),
          city: strOrEmpty(obj.city),
          county: strOrEmpty(obj.county),
          state: strOrEmpty(obj.state),
          zipCode: strOrEmpty(obj.zipCode),
          licenseType: strOrEmpty(obj.licenseType),
          hasExistingLicense: strOrEmpty(obj.hasExistingLicense),
          licenseNumber: strOrEmpty(obj.licenseNumber),
          additionalNotes: strOrEmpty(obj.additionalNotes),
        },
      };
    }
    case "contractor-qualifier": {
      return {
        valid: true,
        data: {
          ...base,
          type: "contractor-qualifier",
          workLocation: strOrEmpty(obj.workLocation),
          scopeOfWork: strOrEmpty(obj.scopeOfWork),
          entityStatus: strOrEmpty(obj.entityStatus),
          experience: strOrEmpty(obj.experience),
          certifications: strArray(obj.certifications),
          timeline: strOrEmpty(obj.timeline),
          verdict: strOrEmpty(obj.verdict),
          preferredLanguage: strOrEmpty(obj.preferredLanguage),
        },
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Supabase persist — now returns success/failure (success gate uses it).
// ---------------------------------------------------------------------------

/**
 * Store lead in Supabase pwa_leads table.
 * Returns `true` on success, `false` on any failure (logged).
 */
async function storeLeadInSupabase(data: LeadSubmission): Promise<boolean> {
  const supabase = await getSupabase();
  if (!supabase) return false;

  const isBooking = data.type === "booking";
  const supabaseSource = isBooking ? "booking" : "contact";

  const message =
    data.type === "booking" ? data.message ?? data.description :
    data.type === "contact" ? data.message :
    data.type === "client-info" ? data.additionalNotes :
    data.type === "corporate-registration" ? data.additionalNotes :
    data.type === "insurance" ? data.notes :
    data.type === "home-improvement" ? data.additionalNotes :
    data.type === "contractor-qualifier" ? `Verdict: ${data.verdict ?? "unknown"} | Scope: ${data.scopeOfWork ?? ""} | Location: ${data.workLocation ?? ""}` :
    undefined;

  const servicesList =
    data.type === "contact" ? data.services :
    data.type === "insurance" ? data.insuranceTypesNeeded :
    undefined;

  const serviceType =
    data.type === "booking" ? data.serviceType :
    data.type === "client-info" ? data.serviceInterested :
    servicesList?.join(", ") ?? null;

  const row = {
    name: data.fullName,
    email: data.email || null,
    phone: data.phone,
    message: message || null,
    service_type: serviceType || null,
    booking_date: isBooking ? (data as { preferredDate?: string }).preferredDate || null : null,
    booking_time: isBooking ? (data as { preferredTime?: string }).preferredTime || null : null,
    booking_type: isBooking ? (data as { serviceType?: string }).serviceType || null : null,
    source: supabaseSource,
    status: "new",
    metadata: {
      lead_type: data.type,
      origin_source: data.source,
      utm: data.utm || null,
      raw: data,
    },
  };

  try {
    const { error } = await supabase.from("pwa_leads").insert(row);
    if (error) {
      console.error("[Supabase] Insert failed:", error.message);
      return false;
    }
    console.log("[Supabase] Lead stored successfully");
    return true;
  } catch (err) {
    console.error("[Supabase] Unexpected error:", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Taskboard webhook forward — returns success/failure for success gate.
// ---------------------------------------------------------------------------

async function forwardToTaskboard(data: LeadSubmission): Promise<boolean> {
  const webhookSecret = process.env.PWA_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn(
      "[Taskboard Webhook] PWA_WEBHOOK_SECRET not configured, skipping webhook"
    );
    return false;
  }

  const webhookUrl =
    process.env.TASKBOARD_WEBHOOK_URL ||
    "https://app.advantagenys.com/api/webhooks/pwa-lead";

  // Forward full discriminated payload. Taskboard absorbs all fields via
  // contact_profiles.tags[] + service columns.
  const webhookPayload: Record<string, unknown> = {
    ...data,
  };

  // Legacy-compatible: older taskboard handlers expect `message` on booking to
  // come from `description`. Keep both.
  if (data.type === "booking" && !data.message && data.description) {
    webhookPayload.message = data.description;
  }

  // New book-appointment flow: inject discriminated snake_case fields for taskboard.
  if (data.type === "booking" && (data.source === "advantagenys.com_book_appointment" || data.source === "advantagenys.com_book_page")) {
    webhookPayload.name = data.fullName;
    webhookPayload.service_interest = data.serviceType;
    webhookPayload.wants_appointment = data.wantsAppointment ?? true;
    if (data.preferredWindow && data.preferredWindow.length > 0) {
      webhookPayload.preferred_window = data.preferredWindow;
    }
  }

  if (data.formSendId) {
    webhookPayload.send_id = data.formSendId;
    webhookPayload.form_send_id = data.formSendId;
  }

  // `turnstileToken` is server-side only; strip from the outgoing payload.
  delete (webhookPayload as Record<string, unknown>).turnstileToken;

  try {
    const webhookRes = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pwa-secret": webhookSecret,
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!webhookRes.ok) {
      const text = await webhookRes.text().catch(() => "");
      console.error(
        "[Taskboard Webhook] Failed with status",
        webhookRes.status,
        text
      );
      return false;
    }
    return true;
  } catch (webhookErr) {
    console.error("[Taskboard Webhook] Error:", webhookErr);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // --- Rate limit (per IP) ------------------------------------------------
  const ip = getClientIp(request.headers);
  if (contactLimiter.isLimited(ip)) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many submissions. Please wait a moment and try again.",
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const result = validatePayload(body);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    const data = normalizeGovernmentLead(result.data);

    // --- Turnstile verification (fail-closed in production) ---------------
    const isProduction = process.env.NODE_ENV === "production";
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;

    if (!turnstileSecret) {
      if (isProduction) {
        console.error(
          "[Turnstile] TURNSTILE_SECRET_KEY missing in production — rejecting (fail-closed)"
        );
        return NextResponse.json(
          {
            success: false,
            error: "Verification service unavailable. Please try again later.",
          },
          { status: 503 }
        );
      }
      // Development: skip verification (legacy dev-ergonomics behavior).
      console.warn(
        "[Turnstile] TURNSTILE_SECRET_KEY not set — skipping verification (dev only)"
      );
    } else {
      const turnstileToken = data.turnstileToken;
      if (!turnstileToken) {
        return NextResponse.json(
          { success: false, error: "Human verification failed" },
          { status: 403 }
        );
      }

      const turnstileRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: turnstileSecret,
            response: turnstileToken,
          }),
        }
      );
      const turnstileData = await turnstileRes.json();

      if (!turnstileData.success) {
        return NextResponse.json(
          { success: false, error: "Human verification failed" },
          { status: 403 }
        );
      }
    }

    // Keep PWA's own generic lead storage minimized. Taskboard receives the
    // full authenticated staff packet because staff need it to complete work.
    const pwaStorageData = maskLeadForPwaStorage(data);

    const logLabel =
      data.type === "booking" ? "[Website Booking]" : `[Lead:${data.type}]`;
    console.log(logLabel, {
      timestamp: new Date().toISOString(),
      source: data.source,
      utm: data.utm,
      type: data.type,
      fullName: data.fullName,
      phone: data.phone,
    });

    // --- Durable writes (success gate) ------------------------------------
    // Run in parallel; either a successful Supabase insert OR taskboard
    // webhook accept constitutes "success". Email is supplementary and does
    // NOT count toward durability.
    const [supabaseOk, webhookOk] = await Promise.all([
      storeLeadInSupabase(pwaStorageData),
      forwardToTaskboard(data),
    ]);

    // Partial miss → structured, greppable log for later alerting.
    if (!supabaseOk || !webhookOk) {
      console.error(
        "[lead-pipeline] partial-miss",
        JSON.stringify({
          source: data.source,
          type: data.type,
          supabase_ok: supabaseOk,
          webhook_ok: webhookOk,
          phone_hash: data.phone.replace(/\D/g, "").slice(-4),
        })
      );
    }

    const anyDurableWriteOk = supabaseOk || webhookOk;

    if (!anyDurableWriteOk) {
      console.error(
        "[lead-pipeline] total-failure — both Supabase and webhook failed"
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "We could not record your request. Please try again or call (929) 933-1396.",
        },
        { status: 502 }
      );
    }

    // --- Best-effort email notification -----------------------------------
    try {
      await sendContactEmail({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        businessType:
          data.type === "contact" || data.type === "corporate-registration" || data.type === "insurance"
            ? data.businessType
            : undefined,
        services: data.type === "contact" ? data.services : undefined,
        message:
          data.type === "booking"
            ? data.description
            : data.type === "contact"
            ? data.message
            : undefined,
        type: data.type === "booking" ? "booking" : undefined,
        serviceType:
          data.type === "booking" ? data.serviceType : undefined,
        preferredDate:
          data.type === "booking" ? data.preferredDate : undefined,
        preferredTime:
          data.type === "booking" ? data.preferredTime : undefined,
        description:
          data.type === "booking" ? data.description : undefined,
      });
      console.log("[Email] Notification sent to", process.env.EMAIL_TO);
    } catch (emailErr) {
      // Non-fatal: webhook + CRM are primary pipeline; email is supplementary.
      console.error("[Email] Failed to send notification:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request." },
      { status: 400 }
    );
  }
}
