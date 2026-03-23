import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/itin-submit
 *
 * Native ITIN form submission from the /itin kiosk page.
 * Accepts FormData (supports passport photo file upload).
 *
 * Dual-write pipeline:
 * 1. Validate required fields
 * 2. Forward to taskboard pwa-lead webhook → Supabase (client + task + itin_applicants)
 * 3. Submit to JotForm Submissions API → JotForm inbox (parallel record)
 *
 * Both writes are non-fatal — if one fails, the other still succeeds.
 *
 * Env vars:
 * - PWA_WEBHOOK_SECRET + TASKBOARD_WEBHOOK_URL → taskboard write
 * - JOTFORM_API_KEY + JOTFORM_ITIN_FORM_ID → JotForm write
 */

// JotForm field mapping (from form 210224697492156 / test clone 260807759178168)
// QID → Field: 13=Name, 31=US Addr, 32=Phone, 33=Email, 35=Citizenship,
// 37=Passport#, 40=Passport Exp, 41=Foreign Addr, 48=Work Addr,
// 51=Income, 29=Upload, 66=Referred By
const JOTFORM_PROD_ID = "210224697492156";

interface ItinPayload {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  addressUsa: string;
  addressHomeCountry: string;
  companyName: string;
  amount: string;
  hasPassport: boolean;
  passportNumber: string;
  passportExpiry: string;
  comment: string;
  passportPhotoBase64?: string;
  passportPhotoFilename?: string;
}

function validate(data: ItinPayload): string | null {
  if (!data.firstName.trim()) return "First name is required";
  if (!data.lastName.trim()) return "Last name is required";
  if (!data.phone.trim() || data.phone.replace(/\D/g, "").length < 7)
    return "Valid phone number is required";
  if (!data.city) return "Appointment city is required";
  return null;
}

/**
 * Submit to JotForm Submissions API (parallel record).
 * Non-fatal — logs errors but never blocks the response.
 */
async function submitToJotForm(data: ItinPayload): Promise<void> {
  const apiKey = process.env.JOTFORM_API_KEY;
  const formId = process.env.JOTFORM_ITIN_FORM_ID || JOTFORM_PROD_ID;

  if (!apiKey) {
    console.warn("[JotForm] JOTFORM_API_KEY not set — JotForm write skipped");
    return;
  }

  // Build JotForm submission payload using question IDs
  const params = new URLSearchParams();

  // q13 — First/Last Name
  params.append("submission[13_first]", data.firstName.trim());
  params.append("submission[13_last]", data.lastName.trim());

  // q32 — Phone
  params.append("submission[32]", data.phone.trim());

  // q33 — Email
  if (data.email.trim()) {
    params.append("submission[33]", data.email.trim());
  }

  // q31 — US Address (single line → addr_line1)
  if (data.addressUsa.trim()) {
    params.append("submission[31_addr_line1]", data.addressUsa.trim());
  }

  // q41 — Foreign (Non-US) Address
  if (data.addressHomeCountry.trim()) {
    params.append("submission[41_addr_line1]", data.addressHomeCountry.trim());
  }

  // q37 — Passport Number
  if (data.passportNumber.trim()) {
    params.append("submission[37]", data.passportNumber.trim());
  }

  // q40 — Passport Expiration Date (YYYY-MM-DD → month/day/year)
  if (data.passportExpiry) {
    const [year, month, day] = data.passportExpiry.split("-");
    if (year && month && day) {
      params.append("submission[40_month]", month);
      params.append("submission[40_day]", day);
      params.append("submission[40_year]", year);
    }
  }

  // q51 — Income
  if (data.amount.trim()) {
    params.append("submission[51]", `$${data.amount.trim()}`);
  }

  // q66 — Referred By (use for company + city + comment)
  const referredParts = [
    data.companyName.trim() && `Company: ${data.companyName.trim()}`,
    data.city && `City: ${data.city === "new_york" ? "New York" : "Nashville"}`,
    data.comment.trim() && `Notes: ${data.comment.trim()}`,
    "Source: ITIN Kiosk (advantagenys.com/itin)",
  ].filter(Boolean);
  params.append("submission[66]", referredParts.join(" | "));

  try {
    const res = await fetch(
      `https://api.jotform.com/form/${formId}/submissions?apiKey=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[JotForm] Submission failed:", res.status, text);
    } else {
      const json = await res.json().catch(() => null);
      console.log("[JotForm] Submission created:", json?.content?.submissionID || "ok");
    }
  } catch (err) {
    console.error("[JotForm] Submission error:", err);
  }
}

/**
 * Forward to taskboard pwa-lead webhook → Supabase.
 * Non-fatal — logs errors but never blocks the response.
 */
async function forwardToTaskboard(data: ItinPayload): Promise<void> {
  const webhookSecret = process.env.PWA_WEBHOOK_SECRET;
  const webhookUrl =
    process.env.TASKBOARD_WEBHOOK_URL ||
    "https://app.advantagenys.com/api/webhooks/pwa-lead";

  if (!webhookSecret) {
    console.warn("[Taskboard] PWA_WEBHOOK_SECRET not set — webhook skipped");
    return;
  }

  const payload = {
    fullName: `${data.firstName.trim()} ${data.lastName.trim()}`,
    phone: data.phone.trim(),
    email: data.email.trim() || undefined,
    services: ["ITIN"],
    source: "itin-kiosk",
    itin: {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      city: data.city,
      addressUsa: data.addressUsa.trim() || undefined,
      addressHomeCountry: data.addressHomeCountry.trim() || undefined,
      companyName: data.companyName.trim() || undefined,
      amount: data.amount.trim() || undefined,
      hasPassport: data.hasPassport,
      passportNumber: data.passportNumber.trim() || undefined,
      passportExpiry: data.passportExpiry || undefined,
      comment: data.comment.trim() || undefined,
      passportPhotoBase64: data.passportPhotoBase64,
      passportPhotoFilename: data.passportPhotoFilename,
    },
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pwa-secret": webhookSecret,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(
        "[Taskboard] Webhook failed:",
        res.status,
        await res.text().catch(() => "")
      );
    } else {
      console.log("[Taskboard] Webhook sent successfully");
    }
  } catch (err) {
    console.error("[Taskboard] Webhook error:", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const data: ItinPayload = {
      firstName: (formData.get("firstName") as string) || "",
      lastName: (formData.get("lastName") as string) || "",
      phone: (formData.get("phone") as string) || "",
      email: (formData.get("email") as string) || "",
      city: (formData.get("city") as string) || "",
      addressUsa: (formData.get("addressUsa") as string) || "",
      addressHomeCountry: (formData.get("addressHomeCountry") as string) || "",
      companyName: (formData.get("companyName") as string) || "",
      amount: (formData.get("amount") as string) || "",
      hasPassport: formData.get("hasPassport") === "true",
      passportNumber: (formData.get("passportNumber") as string) || "",
      passportExpiry: (formData.get("passportExpiry") as string) || "",
      comment: (formData.get("comment") as string) || "",
    };

    // Handle passport photo
    const photoFile = formData.get("passportPhoto") as File | null;
    if (photoFile && photoFile.size > 0) {
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      data.passportPhotoBase64 = buffer.toString("base64");
      data.passportPhotoFilename = photoFile.name;
    }

    // Validate
    const error = validate(data);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    console.log("[ITIN Kiosk] Submission received:", {
      name: `${data.firstName} ${data.lastName}`,
      phone: data.phone,
      city: data.city,
      hasPassport: data.hasPassport,
      hasPhoto: !!data.passportPhotoBase64,
    });

    // Dual-write: taskboard + JotForm in parallel (both non-fatal)
    await Promise.allSettled([
      forwardToTaskboard(data),
      submitToJotForm(data),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ITIN Kiosk] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
