import nodemailer from "nodemailer";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import {
  CAREERS_ROLE_TITLE,
  type AiUseDisclosure,
  type CareerApplicationPayload,
  cleanText,
  scoreCareerApplication,
  validateApplicationPayload,
  validateProof,
  validateResume,
} from "@/lib/careers/product-engineering-associate";
import { storeRecruitingApplication } from "@/lib/careers/recruiting-storage";

export const runtime = "nodejs";

const applicationLimiter = createRateLimiter(20, 60_000, {
  label: "api/careers/product-engineering-associate",
});

export const _testing = { applicationLimiter };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function jsonFromPayload(payload: CareerApplicationPayload) {
  return {
    application_id: payload.applicationId,
    submitted_at: payload.submittedAt,
    role: payload.role,
    hiring_lane: payload.hiringLane,
    referral_code: payload.referralCode ?? null,
    partner_tag: payload.partnerTag,
    candidate: {
      full_name: payload.fullName,
      email: payload.email,
      whatsapp: payload.whatsapp,
      location: payload.location,
      linkedin: payload.linkedin ?? null,
      portfolio: payload.portfolio ?? null,
    },
    resume: {
      url: payload.resumeUrl ?? null,
      file_name: payload.resumeFileName ?? null,
      file_type: payload.resumeFileType ?? null,
      file_size: payload.resumeFileSize ?? null,
    },
    compensation: payload.compensation ?? {},
    availability: payload.availability,
    experience_summary: payload.experienceSummary,
    surfaces: payload.surfaces,
    verification_code: payload.verificationCode ?? null,
    work_sample: {
      issue_findings: payload.issueFindings,
      top_issue_steps: payload.topIssueSteps,
      first_fix_reason: payload.firstFixReason,
      small_improvement: payload.smallImprovement,
      risky_question: payload.riskyQuestion,
      console_network_notes: payload.consoleNetworkNotes,
      proof_links: payload.proofLinks ?? null,
      proof_recording_url: payload.proofRecordingUrl ?? null,
      proof_file_name: payload.proofFileName ?? null,
      proof_file_type: payload.proofFileType ?? null,
      proof_file_size: payload.proofFileSize ?? null,
    },
    ai_use: {
      disclosure: payload.aiUseDisclosure,
      notes: payload.aiUseNotes,
      prompts: payload.aiPrompts,
    },
  };
}

function buildTextBody(payload: CareerApplicationPayload): string {
  return [
    `CAREER APPLICATION - ${payload.role}`,
    `Application ID: ${payload.applicationId}`,
    `Submitted: ${payload.submittedAt}`,
    "",
    `Name: ${payload.fullName}`,
    `Email: ${payload.email}`,
    `WhatsApp/phone: ${payload.whatsapp}`,
    `Location: ${payload.location}`,
    `Referral code: ${payload.referralCode ?? "not provided"}`,
    `LinkedIn: ${payload.linkedin ?? "not provided"}`,
    `Portfolio/GitHub: ${payload.portfolio ?? "not provided"}`,
    `Resume link: ${payload.resumeUrl ?? "file attached or not provided"}`,
    "",
    `Availability: ${payload.availability}`,
    "",
    "Experience summary:",
    payload.experienceSummary,
    "",
    `Surfaces: ${payload.surfaces.join(", ")}`,
    "",
    "Issue findings:",
    payload.issueFindings,
    "",
    "Top issue steps:",
    payload.topIssueSteps,
    "",
    "Fix first and why:",
    payload.firstFixReason,
    "",
    "Small improvement:",
    payload.smallImprovement,
    "",
    "Question before risky change:",
    payload.riskyQuestion,
    "",
    "Console/network notes:",
    payload.consoleNetworkNotes,
    "",
    `Verification code: ${payload.verificationCode ?? "not provided"}`,
    `Proof links: ${payload.proofLinks ?? "not provided"}`,
    `Proof recording link: ${payload.proofRecordingUrl ?? "not provided"}`,
    `Proof file: ${payload.proofFileName ?? "not attached"}`,
    "",
    `AI/tool usage: ${payload.aiUseDisclosure}`,
    payload.aiUseNotes,
    "",
    "AI prompts used + what was caught/corrected:",
    payload.aiPrompts,
  ].join("\n");
}

function buildHtmlBody(payload: CareerApplicationPayload): string {
  const data = jsonFromPayload(payload);
  const rows = [
    ["Application ID", payload.applicationId],
    ["Name", payload.fullName],
    ["Email", payload.email],
    ["WhatsApp/phone", payload.whatsapp],
    ["Location", payload.location],
    ["Referral code", payload.referralCode ?? "not provided"],
    ["AI/tool usage", payload.aiUseDisclosure],
  ]
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 10px;font-weight:700;background:#f8fafc;border-bottom:1px solid #e2e8f0;white-space:nowrap;">${escapeHtml(label)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#1e293b;">
  <div style="max-width:760px;margin:28px auto;background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
    <div style="background:#1a3a5c;color:#fff;padding:22px 28px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#cbd5e1;">Advantage recruiting intake</div>
      <h1 style="margin:6px 0 0;font-size:22px;">${escapeHtml(payload.role)}</h1>
    </div>
    <div style="padding:24px 28px;">
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;font-size:14px;">${rows}</table>
      <h2 style="font-size:16px;margin:24px 0 8px;">Work sample</h2>
      <pre style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;font-size:13px;">${escapeHtml(JSON.stringify(data.work_sample, null, 2))}</pre>
      <h2 style="font-size:16px;margin:24px 0 8px;">Full JSON</h2>
      <pre style="white-space:pre-wrap;background:#0f172a;color:#e2e8f0;border-radius:6px;padding:12px;font-size:12px;">${escapeHtml(JSON.stringify(data, null, 2))}</pre>
    </div>
  </div>
</body>
</html>`;
}

async function sendCareersEmail(
  payload: CareerApplicationPayload,
  resumeFile: File | null,
  proofFile: File | null
): Promise<boolean> {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT ?? "465", 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const to = process.env.CAREERS_TO_EMAIL ?? process.env.EMAIL_TO;

  if (!host || !user || !pass || !to) return false;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const attachmentList: Array<{ filename: string; content: Buffer; contentType: string }> = [];
  if (resumeFile && resumeFile.size > 0) {
    attachmentList.push({
      filename: resumeFile.name,
      content: Buffer.from(await resumeFile.arrayBuffer()),
      contentType: resumeFile.type,
    });
  }
  if (proofFile && proofFile.size > 0) {
    attachmentList.push({
      filename: `proof-${proofFile.name}`,
      content: Buffer.from(await proofFile.arrayBuffer()),
      contentType: proofFile.type,
    });
  }
  const attachments = attachmentList.length > 0 ? attachmentList : undefined;

  await transporter.sendMail({
    from: `"Advantage Recruiting" <${user}>`,
    to,
    replyTo: `"${payload.fullName}" <${payload.email}>`,
    subject: `Career application: ${payload.fullName} - ${payload.role}`,
    text: buildTextBody(payload),
    html: buildHtmlBody(payload),
    attachments,
  });

  return true;
}

async function forwardToCareersWebhook(payload: CareerApplicationPayload): Promise<boolean> {
  const webhookUrl = process.env.CAREERS_WEBHOOK_URL;
  if (!webhookUrl) return false;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (process.env.CAREERS_WEBHOOK_SECRET) {
    headers["x-careers-secret"] = process.env.CAREERS_WEBHOOK_SECRET;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(jsonFromPayload(payload)),
  });

  return response.ok;
}

function buildPayload(
  formData: FormData,
  resumeFile: File | null,
  proofFile: File | null
): CareerApplicationPayload {
  const aiUseDisclosure = (cleanText(formData.get("aiUseDisclosure")) ?? "yes") as AiUseDisclosure;

  return {
    applicationId: randomUUID(),
    submittedAt: new Date().toISOString(),
    role: CAREERS_ROLE_TITLE,
    hiringLane: "junior_product_engineering_associate",
    referralCode: cleanText(formData.get("referralCode")),
    partnerTag: "JKH",
    fullName: cleanText(formData.get("fullName")) ?? "",
    email: cleanText(formData.get("email")) ?? "",
    whatsapp: cleanText(formData.get("whatsapp")) ?? "",
    location: cleanText(formData.get("location")) ?? "",
    linkedin: cleanText(formData.get("linkedin")),
    portfolio: cleanText(formData.get("portfolio")),
    resumeUrl: cleanText(formData.get("resumeUrl")),
    resumeFileName: resumeFile?.name,
    resumeFileType: resumeFile?.type,
    resumeFileSize: resumeFile?.size,
    availability: cleanText(formData.get("availability")) ?? "",
    experienceSummary: cleanText(formData.get("experienceSummary")) ?? "",
    surfaces: formData
      .getAll("surfaces")
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      .map((value) => value.trim()),
    verificationCode: cleanText(formData.get("verificationCode")),
    issueFindings: cleanText(formData.get("issueFindings")) ?? "",
    topIssueSteps: cleanText(formData.get("topIssueSteps")) ?? "",
    firstFixReason: cleanText(formData.get("firstFixReason")) ?? "",
    smallImprovement: cleanText(formData.get("smallImprovement")) ?? "",
    riskyQuestion: cleanText(formData.get("riskyQuestion")) ?? "",
    consoleNetworkNotes: cleanText(formData.get("consoleNetworkNotes")) ?? "",
    proofLinks: cleanText(formData.get("proofLinks")),
    proofRecordingUrl: cleanText(formData.get("proofRecordingUrl")),
    proofFileName: proofFile?.name,
    proofFileType: proofFile?.type,
    proofFileSize: proofFile?.size,
    aiUseDisclosure,
    aiUseNotes: cleanText(formData.get("aiUseNotes")) ?? "",
    aiPrompts: cleanText(formData.get("aiPrompts")) ?? "",
  };
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "size" in value &&
    "type" in value &&
    "arrayBuffer" in value
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  if (applicationLimiter.isLimited(ip)) {
    return NextResponse.json(
      { success: false, error: "Too many submissions. Please wait and try again." },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const rawResume = formData.get("resume");
    const resumeFile = isUploadedFile(rawResume) && rawResume.size > 0 ? rawResume : null;
    const resumeValidation = validateResume(resumeFile);

    if (!resumeValidation.valid) {
      return NextResponse.json(
        { success: false, error: resumeValidation.error },
        { status: 400 }
      );
    }

    const rawProof = formData.get("proofScreenshot");
    const proofFile = isUploadedFile(rawProof) && rawProof.size > 0 ? rawProof : null;
    const proofValidation = validateProof(proofFile);

    if (!proofValidation.valid) {
      return NextResponse.json(
        { success: false, error: proofValidation.error },
        { status: 400 }
      );
    }

    const payload = buildPayload(formData, resumeFile, proofFile);
    const validation = validateApplicationPayload(payload);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const score = scoreCareerApplication(payload);
    const [storageResult, webhookOk, emailOk] = await Promise.all([
      storeRecruitingApplication(payload, score, resumeFile, proofFile).catch((error) => ({
        supabaseOk: false,
        resume: { uploaded: false },
        proof: { uploaded: false },
        error: error instanceof Error ? error.message : "Recruiting storage failed.",
      })),
      forwardToCareersWebhook(payload).catch((error) => {
        console.error("[careers] webhook failed", error);
        return false;
      }),
      sendCareersEmail(payload, resumeFile, proofFile).catch((error) => {
        console.error("[careers] email failed", error);
        return false;
      }),
    ]);

    const deliveryOk = storageResult.supabaseOk || webhookOk || emailOk;
    const noDeliveryConfigured =
      !process.env.CAREERS_WEBHOOK_URL &&
      !(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS && (process.env.CAREERS_TO_EMAIL || process.env.EMAIL_TO));

    if (!storageResult.supabaseOk && process.env.NODE_ENV === "production") {
      console.error("[careers] Supabase storage failed", storageResult.error);
      return NextResponse.json(
        { success: false, error: "Application could not be recorded. Please try again." },
        { status: 502 }
      );
    }

    if (!deliveryOk && !noDeliveryConfigured) {
      return NextResponse.json(
        { success: false, error: "Application could not be recorded. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      applicationId: payload.applicationId,
      delivery: {
        supabase: storageResult.supabaseOk,
        resumeUploaded: storageResult.resume.uploaded,
        proofUploaded: storageResult.proof?.uploaded ?? false,
        webhook: webhookOk,
        email: emailOk,
        localOnly: !deliveryOk && noDeliveryConfigured,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid application submission." },
      { status: 400 }
    );
  }
}
