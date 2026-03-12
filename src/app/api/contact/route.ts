import { NextRequest, NextResponse } from "next/server";

// TODO: Wire to email service (Resend, SendGrid, or nodemailer) for delivery to 229advantage@gmail.com
// TODO: Wire to Jotform submission API or advantage-taskboard CRM pipeline for lead tracking
// TODO: Add rate limiting to prevent spam

interface ContactPayload {
  fullName: string;
  phone: string;
  email?: string;
  businessType?: string;
  services?: string[];
  message?: string;
}

function validatePayload(
  body: unknown
): { valid: true; data: ContactPayload } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object." };
  }

  const { fullName, phone, email, businessType, services, message } =
    body as Record<string, unknown>;

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
    },
  };
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

    // Server-side log for now -- replace with email/CRM integration
    // TODO: Wire to email service (Resend, SendGrid, or nodemailer) for delivery to 229advantage@gmail.com
    // TODO: Add rate limiting to prevent spam
    console.log("[Contact Form Submission]", {
      timestamp: new Date().toISOString(),
      ...data,
    });

    // --- Forward to taskboard webhook ---
    const webhookSecret = process.env.PWA_WEBHOOK_SECRET;
    if (webhookSecret) {
      const webhookUrl =
        process.env.TASKBOARD_WEBHOOK_URL ||
        "https://app.advantagenys.com/api/webhooks/pwa-lead";

      try {
        const webhookRes = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-pwa-secret": webhookSecret,
          },
          body: JSON.stringify({
            fullName: data.fullName,
            phone: data.phone,
            email: data.email,
            businessType: data.businessType,
            services: data.services,
            message: data.message,
          }),
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
        "[Taskboard Webhook] PWA_WEBHOOK_SECRET not set, skipping webhook call"
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request." },
      { status: 400 }
    );
  }
}
