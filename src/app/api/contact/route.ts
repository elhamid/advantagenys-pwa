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

    // Server-side log for now -- replace with email/CRM integration
    console.log("[Contact Form Submission]", {
      timestamp: new Date().toISOString(),
      ...data,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request." },
      { status: 400 }
    );
  }
}
