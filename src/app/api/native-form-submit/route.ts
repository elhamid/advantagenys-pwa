import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getNativeFormSchema } from "@/lib/native-form-schemas/generated";
import {
  answerRecord,
  buildJotFormParams,
  buildNativeAnswers,
  collectFormDataValues,
  extractNativeContact,
} from "@/lib/native-form-schemas/answers";
import type { NativeFormSchema } from "@/lib/native-form-schemas/types";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 12 * 1024 * 1024;
const DOCUMENT_BUCKET = process.env.FORM_DOCUMENTS_BUCKET || "form-documents";

const ALLOWED_UPLOAD_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function getString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function getUploadClient() {
  const url = process.env.TASKBOARD_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.TASKBOARD_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function safePathPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "file";
}

function fileExtension(file: File): string {
  const fromName = file.name.includes(".") ? file.name.split(".").pop() : "";
  return safePathPart(fromName || "bin");
}

function uniqueDocumentKey(documentUrls: Record<string, unknown>, label: string, qid: string): string {
  if (!documentUrls[label]) return label;
  const qidKey = `${label} (${qid})`;
  if (!documentUrls[qidKey]) return qidKey;

  let index = 2;
  let key = `${qidKey} ${index}`;
  while (documentUrls[key]) {
    index += 1;
    key = `${qidKey} ${index}`;
  }
  return key;
}

async function ensurePrivateUploadBucket(client: NonNullable<ReturnType<typeof getUploadClient>>): Promise<void> {
  const { data } = await client.storage.getBucket(DOCUMENT_BUCKET);
  if (data) {
    if (data.public) {
      throw new Error("Document upload bucket is public. Refusing to store sensitive form documents.");
    }
    return;
  }

  const { error } = await client.storage.createBucket(DOCUMENT_BUCKET, {
    public: false,
    fileSizeLimit: MAX_FILE_SIZE_BYTES,
    allowedMimeTypes: Array.from(ALLOWED_UPLOAD_TYPES),
  });
  if (error) throw error;
}

async function uploadNativeFiles(args: {
  schema: NativeFormSchema;
  formData: FormData;
  phone: string;
}): Promise<{
  answerUrls: Record<string, string | string[]>;
  documentUrls: Record<string, unknown>;
  errors: string[];
}> {
  const { schema, formData, phone } = args;
  const answerUrls: Record<string, string | string[]> = {};
  const documentUrls: Record<string, unknown> = {};
  const errors: string[] = [];
  const client = getUploadClient();

  const fileFields = schema.fields.filter((field) => field.kind === "file");
  if (fileFields.length === 0) return { answerUrls, documentUrls, errors };

  if (!client) {
    const requiredMissing = fileFields.filter((field) => field.required);
    if (requiredMissing.length > 0) {
      errors.push("Document upload is temporarily unavailable. Please try again later.");
    }
    return { answerUrls, documentUrls, errors };
  }

  try {
    await ensurePrivateUploadBucket(client);
  } catch (err) {
    console.error("[native-form-submit] private upload bucket unavailable", {
      bucket: DOCUMENT_BUCKET,
      message: err instanceof Error ? err.message : String(err),
    });
    errors.push("Document upload is temporarily unavailable. Please try again later.");
    return { answerUrls, documentUrls, errors };
  }

  for (const field of fileFields) {
    const files = formData
      .getAll(`field_${field.qid}`)
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (files.length === 0) continue;

    const urls: string[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`${field.label} exceeds the 12MB upload limit.`);
        continue;
      }
      if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
        errors.push(`${field.label} must be a PDF, Word document, JPG, PNG, or WebP file.`);
        continue;
      }

      const phoneFolder = phone.replace(/\D/g, "").slice(0, 20) || "unknown";
      const path = [
        "native-forms",
        schema.slug,
        phoneFolder,
        `${Date.now()}-${field.qid}-${safePathPart(file.name || field.name)}.${fileExtension(file)}`,
      ].join("/");

      const buffer = Buffer.from(await file.arrayBuffer());
      const { error } = await client.storage.from(DOCUMENT_BUCKET).upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

      if (error) {
        console.error("[native-form-submit] upload failed", {
          form: schema.slug,
          field: field.qid,
          message: error.message,
        });
        errors.push(`Could not upload ${field.label}. Please try again.`);
        continue;
      }

      urls.push(JSON.stringify({
        bucket: DOCUMENT_BUCKET,
        path,
        name: file.name || field.name,
        contentType: file.type,
      }));
    }

    if (urls.length === 1) {
      answerUrls[field.qid] = "Document uploaded";
      documentUrls[uniqueDocumentKey(documentUrls, field.label, field.qid)] = JSON.parse(urls[0]);
    } else if (urls.length > 1) {
      answerUrls[field.qid] = `${urls.length} documents uploaded`;
      documentUrls[uniqueDocumentKey(documentUrls, field.label, field.qid)] = urls.map((url) => JSON.parse(url));
    }
  }

  return { answerUrls, documentUrls, errors };
}

function validateRequiredFields(
  schema: NativeFormSchema,
  values: Record<string, string | string[]>,
  uploadedUrls: Record<string, string | string[]>,
): string[] {
  const missing: string[] = [];
  for (const field of schema.fields) {
    if (!field.required) continue;
    const value = field.kind === "file" ? uploadedUrls[field.qid] : values[field.qid];
    const empty = Array.isArray(value) ? value.length === 0 : !value || value.trim().length === 0;
    if (empty) missing.push(field.label);
  }
  return missing;
}

function firstBusinessName(answers: Record<string, string | string[]>): string | undefined {
  for (const [key, value] of Object.entries(answers)) {
    if (!/business|company|legal/i.test(key)) continue;
    const text = Array.isArray(value) ? value[0] : value;
    if (text && text.trim()) return text.trim();
  }
  return undefined;
}

async function forwardToTaskboard(payload: Record<string, unknown>): Promise<{ ok: boolean; status: number; text: string }> {
  const secret = process.env.PWA_WEBHOOK_SECRET;
  if (!secret) {
    return { ok: false, status: 503, text: "PWA_WEBHOOK_SECRET is not configured" };
  }

  const url = process.env.TASKBOARD_WEBHOOK_URL || "https://app.advantagenys.com/api/webhooks/pwa-lead";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-pwa-secret": secret,
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text().catch(() => "");
  return { ok: res.ok, status: res.status, text };
}

interface JotFormMirrorResult {
  attempted: boolean;
  ok: boolean;
  status: number | null;
}

async function mirrorToJotForm(schema: NativeFormSchema, params: URLSearchParams): Promise<JotFormMirrorResult> {
  const apiKey = process.env.JOTFORM_API_KEY;
  if (!apiKey) {
    console.warn("[native-form-submit] JOTFORM_API_KEY missing; mirror skipped");
    return { attempted: false, ok: false, status: null };
  }

  const res = await fetch(`https://api.jotform.com/form/${schema.jotformId}/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      APIKEY: apiKey,
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[native-form-submit] JotForm mirror failed", {
      form: schema.slug,
      status: res.status,
      text: text.slice(0, 500),
    });
    return { attempted: true, ok: false, status: res.status };
  }

  console.info("[native-form-submit] JotForm mirror completed", {
    form: schema.slug,
    status: res.status,
  });
  return { attempted: true, ok: true, status: res.status };
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid form submission." }, { status: 400 });
  }

  const slug = getString(formData, "formSlug");
  if (!slug) {
    return NextResponse.json({ success: false, error: "Missing form slug." }, { status: 400 });
  }

  const schema = getNativeFormSchema(slug);
  if (!schema) {
    return NextResponse.json({ success: false, error: "Unknown form." }, { status: 404 });
  }

  const values = collectFormDataValues(formData, schema);
  const preliminaryAnswers = buildNativeAnswers(schema, values);
  const preliminaryContact = extractNativeContact(preliminaryAnswers);

  if (!preliminaryContact) {
    return NextResponse.json(
      { success: false, error: "Full name and phone number are required." },
      { status: 400 }
    );
  }

  const uploads = await uploadNativeFiles({
    schema,
    formData,
    phone: preliminaryContact.phone,
  });

  if (uploads.errors.length > 0) {
    return NextResponse.json(
      { success: false, error: uploads.errors[0] },
      { status: 400 }
    );
  }

  const missing = validateRequiredFields(schema, values, uploads.answerUrls);
  if (missing.length > 0) {
    return NextResponse.json(
      { success: false, error: `Missing required field: ${missing[0]}.` },
      { status: 400 }
    );
  }

  const answers = buildNativeAnswers(schema, values, uploads.answerUrls);
  const contact = extractNativeContact(answers);
  if (!contact) {
    return NextResponse.json(
      { success: false, error: "Full name and phone number are required." },
      { status: 400 }
    );
  }

  const sharedBy = getString(formData, "sharedBy");
  const formSendId = getString(formData, "formSendId");
  const utm = {
    utm_source: getString(formData, "utm_source"),
    utm_medium: getString(formData, "utm_medium"),
    utm_campaign: getString(formData, "utm_campaign"),
    utm_term: getString(formData, "utm_term"),
    utm_content: getString(formData, "utm_content"),
    referrer: getString(formData, "referrer"),
  };

  const maskedAnswers = answerRecord(answers, true);
  const taskboardPayload: Record<string, unknown> = {
    fullName: contact.fullName,
    phone: contact.phone,
    email: contact.email,
    type: schema.taskboardType,
    lead_type: schema.taskboardType,
    source: "pwa-native",
    serviceType: schema.serviceType,
    businessName: firstBusinessName(maskedAnswers),
    sharedBy,
    shared_by: sharedBy,
    formSendId,
    form_send_id: formSendId,
    send_id: formSendId,
    documentUrls: uploads.documentUrls,
    metadata: {
      lead_type: schema.taskboardType,
      raw: {
        formTitle: schema.title,
        formSlug: schema.slug,
        jotformId: schema.jotformId,
        answers: maskedAnswers,
        sensitiveFields: answers.filter((answer) => answer.sensitive).map((answer) => answer.label),
        documentUrls: uploads.documentUrls,
        sharedBy,
        formSendId,
        utm,
        sensitivePolicy: "Sensitive answers are masked before taskboard/CRM storage; full values are only sent to the legacy JotForm mirror.",
      },
    },
  };

  const taskboardResult = await forwardToTaskboard(taskboardPayload);
  if (!taskboardResult.ok) {
    console.error("[native-form-submit] taskboard forward failed", {
      form: schema.slug,
      status: taskboardResult.status,
      text: taskboardResult.text.slice(0, 500),
    });
    return NextResponse.json(
      { success: false, error: "We could not save your form. Please try again." },
      { status: 502 }
    );
  }

  const mirrorParams = buildJotFormParams({
    schema,
    answers,
    sharedBy,
    formSendId,
    utm,
  });
  try {
    await mirrorToJotForm(schema, mirrorParams);
  } catch (err) {
    console.error("[native-form-submit] JotForm mirror exception", err);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
