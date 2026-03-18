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

interface ContactPayload {
  fullName: string;
  phone: string;
  email?: string;
  businessType?: string;
  services?: string[];
  message?: string;
  // Booking-specific fields (present when type === "booking")
  type?: "booking";
  serviceType?: string;
  preferredDate?: string;
  preferredTime?: string;
  description?: string;
}

function validatePayload(
  body: unknown
): { valid: true; data: ContactPayload } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object." };
  }

  const {
    fullName,
    phone,
    email,
    businessType,
    services,
    message,
    type,
    serviceType,
    preferredDate,
    preferredTime,
    description,
  } = body as Record<string, unknown>;

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

  return {
    valid: true,
    data: {
      fullName: (fullName as string).trim(),
      phone: (phone as string).trim(),
      email: typeof email === "string" ? email.trim() : undefined,
      businessType: typeof businessType === "string" ? businessType.trim() : undefined,
      services: Array.isArray(services) ? services : undefined,
      message: typeof message === "string" ? message.trim() : undefined,
      // Booking-specific fields
      type: type === "booking" ? "booking" : undefined,
      serviceType: typeof serviceType === "string" ? serviceType.trim() : undefined,
      preferredDate: typeof preferredDate === "string" ? preferredDate.trim() : undefined,
      preferredTime: typeof preferredTime === "string" ? preferredTime.trim() : undefined,
      description: typeof description === "string" ? description.trim() : undefined,
    },
  };
}

/**
 * Store lead in Supabase pwa_leads table.
 * Non-blocking — logs errors but never fails the request.
 */
async function storeLeadInSupabase(data: ContactPayload): Promise<void> {
  const supabase = await getSupabase();
  if (!supabase) return;

  const isBooking = data.type === "booking";
  const source = isBooking ? "booking" : "contact";

  const row = {
    name: data.fullName,
    email: data.email || null,
    phone: data.phone,
    message: data.message || data.description || null,
    service_type: data.serviceType || (data.services?.join(", ") ?? null),
    booking_date: isBooking ? (data.preferredDate || null) : null,
    booking_time: isBooking ? (data.preferredTime || null) : null,
    booking_type: isBooking ? (data.serviceType || null) : null,
    source,
    status: "new",
    metadata: {
      business_type: data.businessType || null,
      services: data.services || null,
      raw_type: data.type || "contact",
    },
  };

  try {
    const { error } = await supabase.from("pwa_leads").insert(row);
    if (error) {
      console.error("[Supabase] Insert failed:", error.message);
    } else {
      console.log("[Supabase] Lead stored successfully");
    }
  } catch (err) {
    console.error("[Supabase] Unexpected error:", err);
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
    if (process.env.TURNSTILE_SECRET_KEY) {
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

    // --- Store in Supabase (non-blocking, best-effort) ---
    storeLeadInSupabase(data).catch((err) =>
      console.error("[Supabase] Background store failed:", err)
    );

    // --- Forward to taskboard webhook ---
    const webhookSecret = process.env.PWA_WEBHOOK_SECRET;
    if (webhookSecret) {
      const webhookUrl =
        process.env.TASKBOARD_WEBHOOK_URL ||
        "https://app.advantagenys.com/api/webhooks/pwa-lead";

      // Build webhook payload — booking fields are included when present
      const webhookPayload: Record<string, unknown> = {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        businessType: data.businessType,
        services: data.services,
        message: data.message ?? data.description,
        source: "website-contact-form",
      };

      if (data.type === "booking") {
        webhookPayload.type = "booking";
        if (data.serviceType) webhookPayload.serviceType = data.serviceType;
        if (data.preferredDate) webhookPayload.preferredDate = data.preferredDate;
        if (data.preferredTime) webhookPayload.preferredTime = data.preferredTime;
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

        if (!webhookRes.ok) {
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
      await sendContactEmail(data);
      console.log("[Email] Notification sent to", process.env.EMAIL_TO);
    } catch (emailErr) {
      // Non-fatal: webhook + CRM are primary pipeline; email is supplementary
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
