import { NextRequest, NextResponse } from "next/server";
import { forms, type FormConfig } from "@/lib/forms";
import { JOTFORM_BACKUP_MARKER } from "@/lib/jotform-backup";

interface JotFormAnswer {
  name: string;
  text: string;
  answer: string | Record<string, string>;
  type: string;
  prettyFormat?: string;
}

interface JotFormSubmission {
  formID: string;
  submissionID: string;
  formTitle: string;
  answers: Record<string, JotFormAnswer>;
  [key: string]: unknown;
}

interface StructuredAnswer {
  field: string;
  value: string | Record<string, string>;
  type: string;
}

interface NormalizedLead {
  fullName: string;
  phone: string;
  email?: string;
  businessName?: string;
  message?: string;
  services: string[];
  serviceType: string;
  source: string;
  type: string;
  sharedBy?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  metadata: {
    lead_type: string;
    raw: Record<string, unknown>;
  };
}

function parseRawRequest(body: string): JotFormSubmission | null {
  try {
    const params = new URLSearchParams(body);
    const rawRequest = params.get("rawRequest");

    if (rawRequest) {
      return JSON.parse(rawRequest) as JotFormSubmission;
    }

    // Fallback: try parsing the body directly as JSON
    return JSON.parse(body) as JotFormSubmission;
  } catch {
    return null;
  }
}

function validatePayload(submission: JotFormSubmission): boolean {
  return Boolean(
    submission.formID &&
    submission.submissionID &&
    typeof submission.answers === "object"
  );
}

function normalizeAnswerValue(value: string | Record<string, string>): string {
  if (typeof value === "string") return value.trim();
  return Object.values(value)
    .map((part) => String(part).trim())
    .filter(Boolean)
    .join(" ");
}

function labelOf(answer: JotFormAnswer): string {
  return `${answer.name || ""} ${answer.text || ""}`.toLowerCase();
}

function structuredAnswers(
  answers: Record<string, JotFormAnswer>
): Record<string, StructuredAnswer> {
  return Object.entries(answers).reduce(
    (acc, [key, value]) => {
      if (value && value.answer !== undefined && value.answer !== null) {
        acc[key] = {
          field: value.name || value.text || `field_${key}`,
          value: value.prettyFormat || value.answer,
          type: value.type,
        };
      }
      return acc;
    },
    {} as Record<string, StructuredAnswer>
  );
}

function findValue(
  answers: Record<string, JotFormAnswer>,
  predicate: (label: string) => boolean
): string | undefined {
  for (const answer of Object.values(answers)) {
    if (!predicate(labelOf(answer))) continue;
    const value = normalizeAnswerValue(answer.prettyFormat || answer.answer);
    if (value) return value;
  }
  return undefined;
}

function findTraceValue(
  answers: Record<string, JotFormAnswer>,
  aliases: string[]
): string | undefined {
  const normalizedAliases = aliases.map((alias) => alias.toLowerCase());
  return findValue(answers, (label) =>
    normalizedAliases.some((alias) => label === alias || label.includes(alias))
  );
}

const PWA_BACKUP_NOTE_FIELD_BY_FORM_ID: Record<string, string> = {
  "220796553658166": "74",
  "220805681432149": "96",
  "220836887470163": "96",
  "222275688928169": "16",
  "220887424251052": "26",
  "220896671023154": "36",
  "230235945738159": "163",
};

function isPwaBackupEcho(submission: JotFormSubmission): boolean {
  const noteField = PWA_BACKUP_NOTE_FIELD_BY_FORM_ID[submission.formID];
  if (!noteField) return false;

  const answer = submission.answers[noteField];
  if (!answer) return false;

  return normalizeAnswerValue(answer.prettyFormat || answer.answer).includes(JOTFORM_BACKUP_MARKER);
}

function serviceForForm(form: FormConfig | undefined, title: string): string {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("itin")) return "ITIN";
  if (lowerTitle.includes("tax")) return "Tax Services";
  if (lowerTitle.includes("profit") || lowerTitle.includes("bookkeeping")) {
    return "Financial Services";
  }
  if (lowerTitle.includes("license") || lowerTitle.includes("hic")) return "Licensing";
  if (lowerTitle.includes("insurance")) return "Insurance";
  if (lowerTitle.includes("citizenship") || lowerTitle.includes("i-130")) {
    return "Immigration & Legal";
  }
  if (lowerTitle.includes("boir") || lowerTitle.includes("corp")) {
    return "Business Formation";
  }

  switch (form?.category) {
    case "tax":
      return "Tax Services";
    case "financial":
      return "Financial Services";
    case "business":
      return "Business Formation";
    case "insurance":
      return "Insurance";
    case "immigration":
      return "Immigration & Legal";
    case "licensing":
      return "Licensing";
    default:
      return "Business Consulting";
  }
}

function leadTypeForForm(form: FormConfig | undefined, title: string): string {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("tax return")) return "tax-return";
  if (lowerTitle.includes("license") || lowerTitle.includes("hic")) return "home-improvement";
  if (lowerTitle.includes("insurance")) return "insurance";
  if (lowerTitle.includes("citizenship") || lowerTitle.includes("i-130")) {
    return "immigration-beneficiary";
  }
  if (lowerTitle.includes("boir") || lowerTitle.includes("corp")) {
    return "corporate-registration";
  }
  if (lowerTitle.includes("itin")) return "jotform-itin-registration";
  return `jotform-${form?.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "submission"}`;
}

function normalizeSubmission(submission: JotFormSubmission): NormalizedLead {
  const form = forms.find((entry) => entry.id === submission.formID);
  const formTitle = submission.formTitle || form?.title || "JotForm Submission";
  const leadType = leadTypeForForm(form, formTitle);
  const serviceType = serviceForForm(form, formTitle);
  const rawAnswers = structuredAnswers(submission.answers);
  const fullName =
    findValue(submission.answers, (label) =>
      (label.includes("full") && label.includes("name")) ||
      label === "name" ||
      label.includes("your name") ||
      (label.includes("name") && !label.includes("business") && !label.includes("company"))
    ) || `${formTitle} — ${submission.submissionID}`;
  const phone =
    findValue(submission.answers, (label) =>
      label.includes("phone") ||
      label.includes("mobile") ||
      label.includes("cell") ||
      label.includes("whatsapp")
    ) || `jotform:${submission.submissionID}`;
  const email = findValue(submission.answers, (label) => label.includes("email"));
  const businessName = findValue(submission.answers, (label) =>
    label.includes("business name") ||
    label.includes("company") ||
    label.includes("corporation") ||
    label.includes("entity name")
  );
  const message = findValue(submission.answers, (label) =>
    label.includes("message") ||
    label.includes("note") ||
    label.includes("comment") ||
    label.includes("description")
  );
  const sharedBy = findTraceValue(submission.answers, [
    "shared_by",
    "shared by",
    "advantageos shared by",
  ]);
  const utmSource = findTraceValue(submission.answers, [
    "utm_source",
    "utm source",
  ]);
  const utmMedium = findTraceValue(submission.answers, [
    "utm_medium",
    "utm medium",
  ]);
  const utmCampaign = findTraceValue(submission.answers, [
    "utm_campaign",
    "utm campaign",
  ]);

  return {
    fullName,
    phone,
    email,
    businessName,
    message,
    services: [serviceType],
    serviceType,
    source: "jotform-webhook",
    type: leadType,
    ...(sharedBy ? { sharedBy } : {}),
    ...(utmSource ? { utmSource } : {}),
    ...(utmMedium ? { utmMedium } : {}),
    ...(utmCampaign ? { utmCampaign } : {}),
    metadata: {
      lead_type: leadType,
      raw: {
        formID: submission.formID,
        submissionID: submission.submissionID,
        formTitle,
        source: "jotform-webhook",
        phone_missing: phone.startsWith("jotform:") ? "true" : "false",
        answers: rawAnswers,
      },
    },
  };
}

async function forwardToTaskboard(payload: NormalizedLead): Promise<{
  ok: boolean;
  status: number;
  response: string;
}> {
  const webhookSecret = process.env.PWA_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return { ok: false, status: 0, response: "PWA_WEBHOOK_SECRET missing" };
  }

  const webhookUrl =
    process.env.TASKBOARD_WEBHOOK_URL ||
    "https://app.advantagenys.com/api/webhooks/pwa-lead";

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-pwa-secret": webhookSecret,
    },
    body: JSON.stringify(payload),
  });

  return {
    ok: res.ok,
    status: res.status,
    response: await res.text(),
  };
}

export async function POST(request: NextRequest) {
  const webhookSecret = request.headers.get("x-jotform-webhook-secret");
  const expectedSecret = process.env.JOTFORM_API_KEY;

  // If a webhook secret header is provided, validate it
  if (webhookSecret && webhookSecret !== expectedSecret) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let body: string;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      body = await request.text();
    } else {
      body = await request.text();
    }

    const submission = parseRawRequest(body);

    if (!submission) {
      return NextResponse.json(
        { error: "Invalid payload: could not parse submission data" },
        { status: 400 }
      );
    }

    if (!validatePayload(submission)) {
      return NextResponse.json(
        { error: "Invalid payload: missing required fields (formID, submissionID, answers)" },
        { status: 400 }
      );
    }

    if (isPwaBackupEcho(submission)) {
      console.log("[JotForm Webhook] Ignored PWA backup echo", {
        formID: submission.formID,
        submissionID: submission.submissionID,
      });

      return NextResponse.json({
        success: true,
        ignored: true,
        reason: "pwa-backup-echo",
        formID: submission.formID,
        submissionID: submission.submissionID,
        taskboardForwarded: false,
      });
    }

    const leadPayload = normalizeSubmission(submission);

    const forwardResult = await forwardToTaskboard(leadPayload);
    if (!forwardResult.ok) {
      console.error("[JotForm Webhook] Taskboard forward failed", {
        status: forwardResult.status,
        response: forwardResult.response,
        formID: submission.formID,
        submissionID: submission.submissionID,
      });

      if (process.env.VERCEL_ENV === "production") {
        return NextResponse.json(
          {
            error: "Taskboard webhook failed",
            formID: submission.formID,
            submissionID: submission.submissionID,
          },
          { status: 502 }
        );
      }
    }

    // Structure the parsed data
    const structured = {
      formID: submission.formID,
      submissionID: submission.submissionID,
      formTitle: submission.formTitle || "Unknown Form",
      receivedAt: new Date().toISOString(),
      answerCount: Object.keys(submission.answers).length,
      answers: structuredAnswers(submission.answers),
    };

    // Log structured data (will be replaced with DB storage later)
    console.log("[JotForm Webhook]", JSON.stringify(structured, null, 2));

    return NextResponse.json({
      success: true,
      formID: structured.formID,
      submissionID: structured.submissionID,
      taskboardForwarded: forwardResult.ok,
    });
  } catch (error) {
    console.error("[JotForm Webhook Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "JotForm Webhook",
    timestamp: new Date().toISOString(),
  });
}
