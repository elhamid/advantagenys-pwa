/**
 * itin-storage.ts
 *
 * Server-side utility for uploading ITIN applicant documents
 * (passport scans, selfies, signatures) to Supabase Storage
 * on the taskboard project.
 *
 * Uses the service role key — this module must only be imported
 * from API routes (server-side), never from client components.
 *
 * Bucket: itin-documents (public, created on nbzvajwtoovogxrsvbnp)
 * Path convention: {clientPhone}/{type}-{timestamp}.{ext}
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "itin-documents";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function getServiceClient(): SupabaseClient | null {
  const url = process.env.TASKBOARD_SUPABASE_URL;
  const serviceKey = process.env.TASKBOARD_SUPABASE_SERVICE_KEY;

  if (!url || !serviceKey) {
    console.warn(
      "[itin-storage] Missing TASKBOARD_SUPABASE_URL or TASKBOARD_SUPABASE_SERVICE_KEY — uploads disabled"
    );
    return null;
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function buildStoragePath(
  phone: string,
  type: "passport" | "selfie" | "signature",
  filename: string
): string {
  const timestamp = Date.now();
  const ext = filename.includes(".") ? filename.split(".").pop() : "bin";
  // Sanitize phone: strip non-numeric chars to avoid path traversal
  const safePhone = phone.replace(/[^0-9]/g, "");
  return `${safePhone}/${type}-${timestamp}.${ext}`;
}

/**
 * Validate a file buffer before upload.
 * Returns an error string if invalid, null if valid.
 */
function validateFile(
  file: Buffer,
  contentType: string,
  type: string,
  phone: string
): string | null {
  if (file.length === 0) {
    console.warn(
      `[itin-storage] Empty file rejected — type=${type}, phone=${phone}`
    );
    return "File is empty";
  }

  if (file.length > MAX_FILE_SIZE_BYTES) {
    console.warn(
      `[itin-storage] File too large (${file.length} bytes, max 10MB) — type=${type}, phone=${phone}`
    );
    return `File exceeds 10MB limit (received ${(file.length / 1024 / 1024).toFixed(1)}MB)`;
  }

  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    console.warn(
      `[itin-storage] Unsupported content type "${contentType}" — type=${type}, phone=${phone}`
    );
    return `Unsupported file type "${contentType}" — only JPEG, PNG, and WebP are accepted`;
  }

  return null;
}

/**
 * Upload a single ITIN document to Supabase Storage.
 *
 * @param file        Raw file buffer (received from multipart/form-data on an API route)
 * @param filename    Original filename (used to derive the extension)
 * @param phone       Applicant phone number (used as the folder name)
 * @param type        Document type: "passport" | "selfie" | "signature"
 * @param contentType MIME type, e.g. "image/jpeg", "image/png", "image/webp"
 * @returns           Public URL string, or null on any failure (non-fatal)
 */
export async function uploadItinDocument(
  file: Buffer,
  filename: string,
  phone: string,
  type: "passport" | "selfie" | "signature",
  contentType: string
): Promise<string | null> {
  const validationError = validateFile(file, contentType, type, phone);
  if (validationError) {
    console.warn(
      `[itin-storage] Validation failed for ${type} (phone=${phone}): ${validationError}`
    );
    return null;
  }

  const supabase = getServiceClient();
  if (!supabase) return null;

  const path = buildStoragePath(phone, type, filename);

  try {
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType,
      upsert: false,
    });

    if (error) {
      console.error(
        `[itin-storage] Upload failed — type=${type}, phone=${phone}, path=${path}:`,
        error.message
      );
      return null;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

    if (!data.publicUrl) {
      console.error(
        `[itin-storage] Failed to get public URL — type=${type}, phone=${phone}, path=${path}`
      );
      return null;
    }

    console.log(
      `[itin-storage] Uploaded ${type} for phone=${phone}: ${data.publicUrl}`
    );
    return data.publicUrl;
  } catch (err) {
    console.error(
      `[itin-storage] Unexpected error uploading ${type} (phone=${phone}):`,
      err
    );
    return null;
  }
}

/**
 * Upload multiple ITIN documents in parallel for a single applicant.
 *
 * @param documents  Array of document descriptors
 * @param phone      Applicant phone number (shared folder)
 * @returns          Map of type → public URL (null if that upload failed or was skipped)
 *
 * @example
 * const urls = await uploadMultipleItinDocuments(
 *   [
 *     { file: passportBuf, filename: "passport.jpg", type: "passport", contentType: "image/jpeg" },
 *     { file: selfieBuf,   filename: "selfie.jpg",   type: "selfie",   contentType: "image/jpeg" },
 *   ],
 *   "9292929280"
 * );
 * // urls.passport  === "https://..."
 * // urls.selfie    === "https://..."
 * // urls.signature === null (not supplied)
 */
export async function uploadMultipleItinDocuments(
  documents: Array<{
    file: Buffer;
    filename: string;
    type: "passport" | "selfie" | "signature";
    contentType: string;
  }>,
  phone: string
): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {
    passport: null,
    selfie: null,
    signature: null,
  };

  if (documents.length === 0) return results;

  const uploads = documents.map(({ file, filename, type, contentType }) =>
    uploadItinDocument(file, filename, phone, type, contentType).then((url) => {
      results[type] = url;
    })
  );

  await Promise.allSettled(uploads);

  return results;
}
