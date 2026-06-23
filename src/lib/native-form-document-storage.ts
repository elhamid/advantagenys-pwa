import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import type { NativeFormField, NativeFormSchema } from "@/lib/native-form-schemas/types";

export const MAX_FILE_SIZE_BYTES = 3.5 * 1024 * 1024;
export const DOCUMENT_BUCKET = process.env.FORM_DOCUMENTS_BUCKET || "form-documents";

export const ALLOWED_UPLOAD_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export interface NativeUploadedDocumentRef {
  bucket: string;
  path: string;
  name: string;
  contentType: string;
  size: number;
  fieldQid: string;
  fieldLabel: string;
}

export function getUploadClient() {
  const url = process.env.TASKBOARD_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.TASKBOARD_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function safePathPart(value: string): string {
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

export async function ensurePrivateUploadBucket(client: NonNullable<ReturnType<typeof getUploadClient>>): Promise<void> {
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

export function validateNativeFile(file: File, field: NativeFormField): string | null {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `${field.label} is too large after browser preparation. Please upload a smaller file or lower-resolution photo.`;
  }
  if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
    return `${field.label} must be a PDF, Word document, JPG, PNG, or WebP file.`;
  }
  return null;
}

export async function uploadNativeDocument(args: {
  schema: NativeFormSchema;
  field: NativeFormField;
  file: File;
  phone?: string;
}): Promise<NativeUploadedDocumentRef> {
  const { schema, field, file, phone } = args;
  const client = getUploadClient();
  if (!client) {
    throw new Error("Document upload is temporarily unavailable. Please try again later.");
  }

  await ensurePrivateUploadBucket(client);

  const validationError = validateNativeFile(file, field);
  if (validationError) throw new Error(validationError);

  const phoneFolder = (phone || "").replace(/\D/g, "").slice(0, 20) || "pending";
  const path = [
    "native-forms",
    schema.slug,
    phoneFolder,
    `${Date.now()}-${crypto.randomUUID()}-${field.qid}-${safePathPart(file.name || field.name)}.${fileExtension(file)}`,
  ].join("/");

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await client.storage.from(DOCUMENT_BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;

  return {
    bucket: DOCUMENT_BUCKET,
    path,
    name: file.name || field.name,
    contentType: file.type,
    size: file.size,
    fieldQid: field.qid,
    fieldLabel: field.label,
  };
}

export function parseUploadedDocumentRefs(value: string | null): NativeUploadedDocumentRef[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidUploadedDocumentRef);
  } catch {
    return [];
  }
}

export function isValidUploadedDocumentRef(value: unknown): value is NativeUploadedDocumentRef {
  if (!value || typeof value !== "object") return false;
  const ref = value as Record<string, unknown>;
  return (
    ref.bucket === DOCUMENT_BUCKET &&
    typeof ref.path === "string" &&
    ref.path.startsWith("native-forms/") &&
    typeof ref.name === "string" &&
    typeof ref.contentType === "string" &&
    typeof ref.size === "number" &&
    typeof ref.fieldQid === "string" &&
    typeof ref.fieldLabel === "string"
  );
}
