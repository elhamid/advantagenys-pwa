import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";
import {
  LEAD_SOURCES,
  type LeadSource,
  type LeadSubmission,
  type UtmParams,
} from "@/lib/leads/types";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

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

const contactLimiter = createRateLimiter(10, 60_000, { label: "api/contact" });

/** Exposed for tests to reset between assertions. Do not use in production code. */
export const _testing = { contactLimiter };

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
  const turnstileToken = str(obj.turnstileToken);

  // --- Build variant --------------------------------------------------------
  const base = {
    fullName,
    phone: phoneRaw,
    email,
    source,
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
      return {
        valid: true,
        data: {
          ...base,
          type: "booking",
          serviceType: strOrEmpty(obj.serviceType),
          preferredDate: strOrEmpty(obj.preferredDate),
          preferredTime: strOrEmpty(obj.preferredTime),
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
          businessAddress: strOrEmpty(obj.businessAddress),
          city: strOrEmpty(obj.city),
          state: strOrEmpty(obj.state),
          zipCode: strOrEmpty(obj.zipCode),
          natureOfBusiness: strOrEmpty(obj.natureOfBusiness),
          numberOfMembers: strOrEmpty(obj.numberOfMembers),
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
          state: strOrEmpty(obj.state),
          zipCode: strOrEmpty(obj.zipCode),
          licenseType: strOrEmpty(obj.licenseType),
          hasExistingLicense: strOrEmpty(obj.hasExistingLicense),
          licenseNumber: strOrEmpty(obj.licenseNumber),
          additionalNotes: strOrEmpty(obj.additionalNotes),
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

    const { data } = result;

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
      storeLeadInSupabase(data),
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
