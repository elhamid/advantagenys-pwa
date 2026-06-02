import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";

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

// TODO: Add rate limiting to prevent spam

type LeadType =
  | "booking"
  | "corporate-registration"
  | "client-info"
  | "home-improvement"
  | "insurance"
  | "immigration-petitioner"
  | "immigration-beneficiary"
  | "tax-return";

interface ContactPayload {
  fullName: string;
  phone: string;
  email?: string;
  businessType?: string;
  services?: string[];
  message?: string;
  source?: string;
  type?: LeadType;
  serviceType?: string;
  /** @deprecated Use preferredWindow instead */
  preferredDate?: string;
  /** @deprecated Use preferredWindow instead */
  preferredTime?: string;
  description?: string;
  // Phase 0+ booking fields
  wantsAppointment?: boolean;
  preferredWindow?: string[];
  // Generic catch-all for extended form fields (immigration, tax, etc.)
  // These are forwarded to Supabase metadata + taskboard webhook as-is.
  [key: string]: unknown;
}

function validatePayload(
  body: unknown
): { valid: true; data: ContactPayload } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object." };
  }

  const ALLOWED_SOURCES = [
    "website-contact-form",
    "website-booking",
    "advantagenys.com_book_appointment",
    "website-immigration-petitioner",
    "website-immigration-beneficiary",
    "website-tax-return",
    "website-corporate-registration",
    "website-client-info",
    "website-home-improvement",
    "website-insurance",
    "chat-widget",
    "kiosk",
  ];

  const raw = body as Record<string, unknown>;
  const {
    fullName,
    phone,
    email,
    businessType,
    services,
    message,
    source,
    type,
    serviceType,
    preferredDate,
    preferredTime,
    description,
    wantsAppointment,
    preferredWindow,
  } = raw;

  if (typeof fullName !== "string" || fullName.trim().length === 0) {
    return { valid: false, error: "Full name is required." };
  }

  if (typeof phone !== "string" || phone.trim().length < 7) {
    return {
      valid: false,
      error: "A valid phone number is required (minimum 7 digits).",
    };
  }

  if (email !== undefined && email !== "") {
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { valid: false, error: "Invalid email address." };
    }
  }

  if (services !== undefined && !Array.isArray(services)) {
    return { valid: false, error: "Services must be an array." };
  }

  if (preferredWindow !== undefined && !Array.isArray(preferredWindow)) {
    return { valid: false, error: "preferredWindow must be an array." };
  }

  // Validate source if provided
  const resolvedSource =
    typeof source === "string" && ALLOWED_SOURCES.includes(source)
      ? source
      : undefined;

  // Accepted type discriminators
  const ACCEPTED_TYPES: LeadType[] = [
    "booking",
    "corporate-registration",
    "client-info",
    "home-improvement",
    "insurance",
    "immigration-petitioner",
    "immigration-beneficiary",
    "tax-return",
  ];
  const resolvedType: LeadType | undefined =
    typeof type === "string" && ACCEPTED_TYPES.includes(type as LeadType)
      ? (type as LeadType)
      : undefined;

  // Default source by type when none is explicitly provided
  const defaultSourceByType: Partial<Record<LeadType, string>> = {
    "immigration-petitioner": "website-immigration-petitioner",
    "immigration-beneficiary": "website-immigration-beneficiary",
    "tax-return": "website-tax-return",
    "corporate-registration": "website-corporate-registration",
    "client-info": "website-client-info",
    "home-improvement": "website-home-improvement",
    insurance: "website-insurance",
    booking: "website-booking",
  };

  const finalSource = resolvedSource ??
    (resolvedType ? defaultSourceByType[resolvedType] : undefined);

  // Build base payload
  const data: ContactPayload = {
    fullName: (fullName as string).trim(),
    phone: (phone as string).trim(),
    email: typeof email === "string" ? email.trim() : undefined,
    businessType: typeof businessType === "string" ? businessType.trim() : undefined,
    services: Array.isArray(services) ? services : undefined,
    message: typeof message === "string" ? message.trim() : undefined,
    source: finalSource,
    type: resolvedType,
    serviceType: typeof serviceType === "string" ? serviceType.trim() : undefined,
    preferredDate: typeof preferredDate === "string" ? preferredDate.trim() : undefined,
    preferredTime: typeof preferredTime === "string" ? preferredTime.trim() : undefined,
    description: typeof description === "string" ? description.trim() : undefined,
    wantsAppointment: typeof wantsAppointment === "boolean" ? wantsAppointment : undefined,
    preferredWindow: Array.isArray(preferredWindow)
      ? (preferredWindow as string[]).map((w) => String(w).trim())
      : undefined,
  };

  // For extended form types (immigration, tax), pass through all extra string fields
  // so they reach Supabase metadata and the taskboard webhook.
  if (resolvedType && resolvedType !== "booking") {
    const baseKeys = new Set([
      "fullName", "phone", "email", "businessType", "services", "message",
      "source", "type", "serviceType", "preferredDate", "preferredTime",
      "description", "wantsAppointment", "preferredWindow", "turnstileToken",
    ]);
    for (const [k, v] of Object.entries(raw)) {
      if (baseKeys.has(k)) continue;
      if (typeof v === "string" && v.trim().length > 0) {
        data[k] = v.trim();
      }
    }
  }

  return { valid: true, data };
}

/**
 * Store lead in Supabase pwa_leads table.
 * Returns true if the insert succeeded, false otherwise.
 */
async function storeLeadInSupabase(data: ContactPayload): Promise<boolean> {
  const supabase = await getSupabase();
  if (!supabase) return false;

  const isBooking = data.type === "booking";
  const rowSource = data.source ?? (isBooking ? "booking" : "contact");

  // Extract a human-readable message depending on lead type
  const leadMessage =
    data.message ||
    data.description ||
    (typeof data.additionalNotes === "string" ? data.additionalNotes : null) ||
    null;

  const row = {
    name: data.fullName,
    email: data.email || null,
    phone: data.phone,
    message: leadMessage,
    service_type: data.serviceType || (data.services?.join(", ") ?? null),
    booking_date: isBooking ? (data.preferredDate || null) : null,
    booking_time: isBooking ? (data.preferredTime || null) : null,
    booking_type: isBooking ? (data.serviceType || null) : null,
    source: rowSource,
    status: "new",
    metadata: {
      business_type: data.businessType || null,
      services: data.services || null,
      raw_type: data.type || "contact",
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

export async function POST(request: NextRequest) {
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

    // --- Turnstile verification ---
    const turnstileToken = (body as Record<string, unknown>).turnstileToken;
    const nativeFormWithoutWidget =
      data.type === "corporate-registration" ||
      data.type === "client-info" ||
      data.type === "home-improvement" ||
      data.type === "insurance";
    if (process.env.TURNSTILE_SECRET_KEY && !nativeFormWithoutWidget) {
      if (!turnstileToken || typeof turnstileToken !== "string") {
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
            secret: process.env.TURNSTILE_SECRET_KEY,
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

    const logLabel = data.type === "booking" ? "[Website Booking]" : "[Website Lead]";
    console.log(logLabel, {
      timestamp: new Date().toISOString(),
      ...data,
    });

    // --- Store in Supabase ---
    let supabaseOk = false;
    try {
      supabaseOk = await storeLeadInSupabase(data);
    } catch (err) {
      console.error("[Supabase] Background store failed:", err);
    }

    // --- Forward to taskboard webhook ---
    let webhookOk = false;
    const webhookSecret = process.env.PWA_WEBHOOK_SECRET;
    if (webhookSecret) {
      const webhookUrl =
        process.env.TASKBOARD_WEBHOOK_URL ||
        "https://app.advantagenys.com/api/webhooks/pwa-lead";

      const webhookSource = data.source ?? "website-contact-form";

      // Build webhook payload — forward all fields to taskboard
      const webhookPayload: Record<string, unknown> = {
        ...data,
        source: webhookSource,
      };
      // Strip turnstile token — server-side only
      delete webhookPayload.turnstileToken;

      if (data.type === "booking") {
        webhookPayload.type = "booking";
        if (data.serviceType) webhookPayload.serviceType = data.serviceType;
        if (data.preferredDate) webhookPayload.preferredDate = data.preferredDate;
        if (data.preferredTime) webhookPayload.preferredTime = data.preferredTime;
      }

      // AOS discriminated keys — added when source is the new book-appointment flow
      if (
        data.type === "booking" &&
        data.source === "advantagenys.com_book_appointment"
      ) {
        webhookPayload.name = data.fullName;
        webhookPayload.service_interest = data.serviceType;
        webhookPayload.wants_appointment = data.wantsAppointment ?? true;
        const windowJoined = (data.preferredWindow ?? []).join(", ");
        if (windowJoined) webhookPayload.preferred_window = windowJoined;
      }

      try {
        const webhookRes = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-pwa-secret": webhookSecret,
          },
          body: JSON.stringify(webhookPayload),
        });

        if (webhookRes.ok) {
          webhookOk = true;
        } else {
          console.error(
            "[Taskboard Webhook] Failed with status",
            webhookRes.status,
            await webhookRes.text()
          );
        }
      } catch (webhookErr) {
        console.error("[Taskboard Webhook] Error:", webhookErr);
      }
    } else {
      console.warn(
        "[Taskboard Webhook] Website webhook secret not configured, skipping webhook call"
      );
    }

    // --- Send notification email ---
    try {
      await sendContactEmail(data as Parameters<typeof sendContactEmail>[0]);
      console.log("[Email] Notification sent to", process.env.EMAIL_TO);
    } catch (emailErr) {
      // Non-fatal: webhook + CRM are primary pipeline; email is supplementary
      console.error("[Email] Failed to send notification:", emailErr);
    }

    // --- Success gate: at least one durable write must succeed ---
    if (!supabaseOk && !webhookOk) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Submission could not be saved. Please try again or call us at (929) 292-9230.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      ...(supabaseOk && webhookOk ? {} : { partial: true }),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request." },
      { status: 400 }
    );
  }
}
