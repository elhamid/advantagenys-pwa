import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { uploadMultipleItinDocuments } from "@/lib/itin-storage";

/**
 * POST /api/itin-submit
 *
 * Native ITIN form submission from the /itin kiosk page.
 * Accepts FormData (supports document/selfie/signature file uploads).
 *
 * Dual-write pipeline:
 * 1. Validate required fields
 * 2. Upload documents to Supabase Storage (non-fatal)
 * 3. Forward to taskboard pwa-lead webhook → Supabase (client + task + itin_applicants)
 * 4. Submit to JotForm Submissions API → JotForm inbox (parallel record)
 *
 * Both writes are non-fatal — if one fails, the other still succeeds.
 * Document upload failures are also non-fatal — form data is captured regardless.
 *
 * Env vars:
 * - PWA_WEBHOOK_SECRET + TASKBOARD_WEBHOOK_URL → taskboard write
 * - JOTFORM_API_KEY + JOTFORM_ITIN_FORM_ID → JotForm write
 * - TASKBOARD_SUPABASE_URL + TASKBOARD_SUPABASE_SERVICE_KEY → document storage
 */

// Double-submit guard: reject same phone within 30 seconds
const recentSubmissions = new Map<string, number>();
const DOUBLE_SUBMIT_WINDOW_MS = 30_000;

// JotForm field mapping (from form 210224697492156 / test clone 260807759178168)
// QID → Field: 13=Name, 31=US Addr, 32=Phone, 33=Email, 35=Citizenship,
// 37=Passport#, 40=Passport Exp, 41=Foreign Addr, 48=Work Addr,
// 51=Income, 29=Upload, 66=Referred By
const JOTFORM_PROD_ID = "210224697492156";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface DocumentUrls {
  passportScan: string | null;
  selfie: string | null;
  signature: string | null;
}

interface ItinPayload {
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  countryOfBirth: string;
  cityOfBirth: string;
  countryOfCitizenship: string;
  phone: string;
  email: string;
  city: string;
  addressUsa: string;
  zipCode: string;
  addressHomeCountry: string;
  homeCountry: string;
  homeCity: string;
  homeAddress: string;
  usEntryDate: string;
  companyName: string;
  amount: string;
  hasPassport: boolean;
  passportNumber: string;
  passportExpiry: string;
  passportCountry: string;
  comment: string;
  // Backward-compat
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
 * Extract a File from FormData, validate it, and return its Buffer.
 * Returns null (silently) if the field is absent or empty.
 * Returns null with a warning if validation fails (non-fatal).
 */
async function extractValidatedFile(
  formData: FormData,
  fieldName: string,
  label: string
): Promise<{ buffer: Buffer; filename: string; contentType: string } | null> {
  const file = formData.get(fieldName) as File | null;
  if (!file || file.size === 0) return null;

  if (file.size > MAX_FILE_SIZE_BYTES) {
    console.warn(
      `[ITIN Kiosk] ${label} rejected: too large (${(file.size / 1024 / 1024).toFixed(1)}MB, max 10MB)`
    );
    return null;
  }

  const contentType = file.type || "application/octet-stream";
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    console.warn(
      `[ITIN Kiosk] ${label} rejected: unsupported type "${contentType}" — only JPEG, PNG, WebP accepted`
    );
    return null;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return { buffer, filename: file.name || `${fieldName}.bin`, contentType };
}

/**
 * Submit to JotForm Submissions API (parallel record).
 * Non-fatal — logs errors but never blocks the response.
 */
const JOTFORM_TEST_ID = "260813948166061";

async function submitToJotForm(data: ItinPayload, documentUrls?: DocumentUrls, isTest = false): Promise<void> {
  const apiKey = process.env.JOTFORM_API_KEY;
  const formId = isTest ? JOTFORM_TEST_ID : (process.env.JOTFORM_ITIN_FORM_ID || JOTFORM_PROD_ID);

  if (!apiKey) {
    console.warn("[JotForm] JOTFORM_API_KEY not set — JotForm write skipped");
    return;
  }

  // Build JotForm submission payload using question IDs
  // ALL CAPS for TaxWise copy/paste compatibility
  const UP = (s: string) => s.trim().toUpperCase();
  const params = new URLSearchParams();

  // q13 — First/Last Name
  params.append("submission[13_first]", UP(data.firstName));
  params.append("submission[13_last]", UP(data.lastName));

  // q17 — Your Name (used by JotForm as submission title)
  params.append("submission[17]", `${UP(data.firstName)} ${UP(data.lastName)}`);

  // q32 — Phone as XXX-XXX-XXXX format
  const phoneDigits = data.phone.replace(/\D/g, "");
  if (phoneDigits.length >= 10) {
    params.append("submission[32_full]", phoneDigits.slice(0, 10));
  } else {
    params.append("submission[32_full]", phoneDigits);
  }

  // q33 — Email
  if (data.email.trim()) {
    params.append("submission[33]", data.email.trim());
  }

  // q28 — Birth Date (YYYY-MM-DD → month/day/year)
  if (data.dateOfBirth) {
    const [year, month, day] = data.dateOfBirth.split("-");
    if (year && month && day) {
      params.append("submission[28_month]", month);
      params.append("submission[28_day]", day);
      params.append("submission[28_year]", year);
    }
  }

  // q14 — City of Birth
  if (data.cityOfBirth?.trim()) {
    params.append("submission[14]", UP(data.cityOfBirth));
  }

  // q60 — Country of Birth
  if (data.countryOfBirth?.trim()) {
    params.append("submission[60]", UP(data.countryOfBirth));
  }

  // q35 — Citizenship
  if (data.countryOfCitizenship?.trim()) {
    params.append("submission[35]", UP(data.countryOfCitizenship));
  }

  // q31 — US Address (single line → addr_line1 + postal)
  if (data.addressUsa.trim()) {
    params.append("submission[31_addr_line1]", UP(data.addressUsa));
    if (data.zipCode.trim()) {
      params.append("submission[31_postal]", data.zipCode.trim());
    }
  }

  // q64 — Date of Entry into the US (YYYY-MM-DD → MM/DD/YYYY)
  if (data.usEntryDate?.trim()) {
    const [y, m, d] = data.usEntryDate.split("-");
    params.append("submission[64]", (y && m && d) ? `${m}/${d}/${y}` : data.usEntryDate.trim());
  }

  // q41 — Foreign (Non-US) Address (home country details)
  if (data.homeAddress?.trim() || data.addressHomeCountry?.trim()) {
    const addr = data.homeAddress?.trim() || data.addressHomeCountry?.trim() || "";
    params.append("submission[41_addr_line1]", addr.toUpperCase());
    if (data.homeCity?.trim()) {
      params.append("submission[41_addr_line2]", UP(data.homeCity));
    }
    if (data.homeCountry?.trim()) {
      params.append("submission[41_country]", UP(data.homeCountry));
    }
  }

  // q37 — Passport Number
  if (data.passportNumber?.trim()) {
    params.append("submission[37]", UP(data.passportNumber));
  }

  // q38 — Passport Issued By (country)
  if (data.passportCountry?.trim()) {
    params.append("submission[38]", UP(data.passportCountry));
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

  // q66 — Referred By (company + city + middle name + documents + comment)
  const referredParts = [
    data.companyName.trim() && `Company: ${data.companyName.trim()}`,
    data.middleName?.trim() && `Middle Name: ${data.middleName.trim()}`,
    data.city && `City: ${data.city === "new_york" ? "New York" : "Nashville"}`,
    documentUrls?.passportScan && `Passport Scan: ${documentUrls.passportScan}`,
    documentUrls?.selfie && `Selfie: ${documentUrls.selfie}`,
    documentUrls?.signature && `Signature: ${documentUrls.signature}`,
    data.comment.trim() && `Notes: ${data.comment.trim()}`,
    "Source: ITIN Kiosk (advantagenys.com/itin)",
  ].filter(Boolean);
  params.append("submission[66]", referredParts.join(" | "));

  try {
    const res = await fetch(
      `https://api.jotform.com/form/${formId}/submissions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "APIKEY": apiKey,
        },
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
 * Send email notification to the office when a new ITIN kiosk submission arrives.
 * Non-fatal — skipped silently if SMTP env vars are absent.
 */
async function sendNotificationEmail(data: ItinPayload): Promise<void> {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const notifyTo = process.env.ITIN_NOTIFY_EMAIL || "229advantage@gmail.com";

  if (!smtpUser || !smtpPass) {
    console.warn("[email] SMTP_USER or SMTP_PASS not set — notification skipped");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const fullName = `${data.firstName}${data.middleName ? " " + data.middleName : ""} ${data.lastName}`.trim();
  const subject = `New ITIN Application: ${fullName}`;

  const body = `New ITIN application submitted via kiosk.

Name: ${data.firstName}${data.middleName ? " " + data.middleName : ""} ${data.lastName}
Phone: ${data.phone}
Email: ${data.email || "Not provided"}
Date of Birth: ${data.dateOfBirth}
Country of Birth: ${data.countryOfBirth}
City of Birth: ${data.cityOfBirth}
Citizenship: ${data.countryOfCitizenship}

US Address: ${data.addressUsa}${data.zipCode ? " " + data.zipCode : ""}
Entry Date: ${data.usEntryDate || "Not provided"}

Home Country: ${data.homeCountry || "Not provided"}
Home City: ${data.homeCity || "Not provided"}
Home Address: ${data.homeAddress || "Not provided"}

Passport: ${data.passportNumber || "Not provided"}
Passport Expiry: ${data.passportExpiry || "Not provided"}
Passport Country: ${data.passportCountry || "Not provided"}

Company: ${data.companyName || "Individual"}
Annual Earnings: ${data.amount ? "$" + data.amount : "Not provided"}

---
Submitted via ITIN Kiosk at advantagenys.com/itin`.trim();

  try {
    await transporter.sendMail({
      from: `"Advantage Services" <${smtpUser}>`,
      to: notifyTo,
      subject,
      text: body,
    });
    console.log("[email] Notification sent to", notifyTo);
  } catch (err) {
    console.error("[email] Failed to send notification:", err);
  }
}

/**
 * Forward to taskboard pwa-lead webhook → Supabase.
 * Non-fatal — logs errors but never blocks the response.
 */
async function forwardToTaskboard(
  data: ItinPayload,
  documentUrls: DocumentUrls
): Promise<void> {
  const webhookSecret = process.env.PWA_WEBHOOK_SECRET;
  const webhookUrl =
    process.env.TASKBOARD_WEBHOOK_URL ||
    "https://app.advantagenys.com/api/webhooks/pwa-lead";

  if (!webhookSecret) {
    console.warn("[Taskboard] PWA_WEBHOOK_SECRET not set — webhook skipped");
    return;
  }

  // Build documents object — only include keys with actual URLs
  const documents: Record<string, string> = {};
  if (documentUrls.passportScan) documents.passportScan = documentUrls.passportScan;
  if (documentUrls.selfie) documents.selfie = documentUrls.selfie;
  if (documentUrls.signature) documents.signature = documentUrls.signature;

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
      // Backward-compat: include base64 only when no Supabase URLs are available
      ...(Object.keys(documents).length === 0 && data.passportPhotoBase64
        ? {
            passportPhotoBase64: data.passportPhotoBase64,
            passportPhotoFilename: data.passportPhotoFilename,
          }
        : {}),
      ...(Object.keys(documents).length > 0 ? { documents } : {}),
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
  const isTest = request.nextUrl.searchParams.get("test") === "1";
  if (isTest) console.log("[itin-submit] TEST MODE — using staging JotForm");

  try {
    const formData = await request.formData();

    const data: ItinPayload = {
      firstName: (formData.get("firstName") as string) || "",
      lastName: (formData.get("lastName") as string) || "",
      middleName: (formData.get("middleName") as string) || "",
      dateOfBirth: (formData.get("dateOfBirth") as string) || "",
      countryOfBirth: (formData.get("countryOfBirth") as string) || "",
      cityOfBirth: (formData.get("cityOfBirth") as string) || "",
      countryOfCitizenship: (formData.get("countryOfCitizenship") as string) || "",
      phone: (formData.get("phone") as string) || "",
      email: (formData.get("email") as string) || "",
      city: (formData.get("city") as string) || "",
      addressUsa: (formData.get("addressUsa") as string) || "",
      zipCode: (formData.get("zipCode") as string) || "",
      addressHomeCountry: (formData.get("addressHomeCountry") as string) || "",
      homeCountry: (formData.get("homeCountry") as string) || "",
      homeCity: (formData.get("homeCity") as string) || "",
      homeAddress: (formData.get("homeAddress") as string) || "",
      usEntryDate: (formData.get("usEntryDate") as string) || "",
      companyName: (formData.get("companyName") as string) || "",
      amount: (formData.get("amount") as string) || "",
      hasPassport: formData.get("hasPassport") === "true",
      passportNumber: (formData.get("passportNumber") as string) || "",
      passportExpiry: (formData.get("passportExpiry") as string) || "",
      passportCountry: (formData.get("passportCountry") as string) || "",
      comment: (formData.get("comment") as string) || "",
    };

    // Backward-compat: legacy passportPhoto field (base64, no Supabase)
    const legacyPhotoFile = formData.get("passportPhoto") as File | null;
    if (legacyPhotoFile && legacyPhotoFile.size > 0) {
      const buffer = Buffer.from(await legacyPhotoFile.arrayBuffer());
      data.passportPhotoBase64 = buffer.toString("base64");
      data.passportPhotoFilename = legacyPhotoFile.name;
    }

    // Validate required fields
    const error = validate(data);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    // Double-submit guard: reject same phone within 30 seconds
    const normalizedPhone = data.phone.replace(/\D/g, "");
    const now = Date.now();
    const lastSubmit = recentSubmissions.get(normalizedPhone);
    if (lastSubmit && now - lastSubmit < DOUBLE_SUBMIT_WINDOW_MS) {
      return NextResponse.json(
        { success: false, error: "Duplicate submission — please wait before resubmitting" },
        { status: 429 }
      );
    }
    recentSubmissions.set(normalizedPhone, now);

    // Extract new file fields (all optional, all non-fatal on failure)
    const [documentScanFile, selfieFile, signatureFile] = await Promise.all([
      extractValidatedFile(formData, "documentScan", "documentScan"),
      extractValidatedFile(formData, "selfie", "selfie"),
      extractValidatedFile(formData, "signature", "signature"),
    ]);

    console.log("[ITIN Kiosk] Submission received:", {
      name: `${data.firstName} ${data.lastName}`,
      phone: data.phone,
      city: data.city,
      hasPassport: data.hasPassport,
      hasDocumentScan: !!documentScanFile,
      hasSelfie: !!selfieFile,
      hasSignature: !!signatureFile,
    });

    // Upload documents to Supabase Storage (non-fatal)
    const documentUrls: DocumentUrls = {
      passportScan: null,
      selfie: null,
      signature: null,
    };

    const docsToUpload: Array<{
      file: Buffer;
      filename: string;
      type: "passport" | "selfie" | "signature";
      contentType: string;
    }> = [];

    if (documentScanFile) {
      docsToUpload.push({
        file: documentScanFile.buffer,
        filename: documentScanFile.filename,
        type: "passport",
        contentType: documentScanFile.contentType,
      });
    }
    if (selfieFile) {
      docsToUpload.push({
        file: selfieFile.buffer,
        filename: selfieFile.filename,
        type: "selfie",
        contentType: selfieFile.contentType,
      });
    }
    if (signatureFile) {
      docsToUpload.push({
        file: signatureFile.buffer,
        filename: signatureFile.filename,
        type: "signature",
        contentType: signatureFile.contentType,
      });
    }

    if (docsToUpload.length > 0) {
      try {
        const uploadResults = await uploadMultipleItinDocuments(
          docsToUpload,
          data.phone
        );
        documentUrls.passportScan = uploadResults.passport ?? null;
        documentUrls.selfie = uploadResults.selfie ?? null;
        documentUrls.signature = uploadResults.signature ?? null;
      } catch (uploadErr) {
        // Non-fatal: log and continue
        console.warn("[ITIN Kiosk] Document upload error (continuing):", uploadErr);
      }
    }

    // Triple-write: taskboard + JotForm + email notification in parallel (all non-fatal)
    await Promise.allSettled([
      forwardToTaskboard(data, documentUrls),
      submitToJotForm(data, documentUrls, isTest),
      sendNotificationEmail(data),
    ]);

    return NextResponse.json({
      success: true,
      documentsUploaded: {
        passport: documentUrls.passportScan !== null,
        selfie: documentUrls.selfie !== null,
        signature: documentUrls.signature !== null,
      },
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[ITIN Kiosk] Unexpected error:", errMsg, err);
    return NextResponse.json(
      { success: false, error: `Submission failed: ${errMsg}` },
      { status: 400 }
    );
  }
}
