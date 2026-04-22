// /api/passport-ocr — Structured data extraction from passport/ID document images.
// Uses Gemini 2.5 Flash multimodal via OpenRouter for OCR + field extraction.

import { NextRequest } from "next/server";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

// ============================================================================
// Rate limiter — 5 requests per minute per IP (shared helper)
// ============================================================================

const limiter = createRateLimiter(5, 60_000, { label: "api/passport-ocr" });

// ============================================================================
// Allowed passport field keys — strip unknown keys from LLM response
// ============================================================================

const ALLOWED_FIELDS = new Set([
  "firstName",
  "lastName",
  "middleName",
  "dateOfBirth",
  "countryOfBirth",
  "cityOfBirth",
  "countryOfCitizenship",
  "passportNumber",
  "passportExpiry",
  "passportCountry",
  "gender",
]);

// ============================================================================
// Maximum base64 string length — ~15MB covers 10MB binary after encoding
// ============================================================================

const MAX_BASE64_LENGTH = 15 * 1024 * 1024;

// ============================================================================
// Extraction prompt
// ============================================================================

const PASSPORT_OCR_PROMPT = `You are a passport/ID document data extraction engine. Extract all visible fields from the document image and return a JSON object.

## FIELDS TO EXTRACT

| Field | Key | Description |
|-------|-----|-------------|
| First Name | firstName | Given name(s) as shown on document |
| Last Name | lastName | Surname/family name |
| Middle Name | middleName | Middle name if visible, otherwise omit |
| Date of Birth | dateOfBirth | Format: YYYY-MM-DD |
| Nationality | countryOfBirth | Full country name (e.g., "Jamaica", not "JAM") |
| Country of Citizenship | countryOfCitizenship | Usually same as nationality |
| Passport Number | passportNumber | Document number |
| Expiry Date | passportExpiry | Format: YYYY-MM-DD |
| Issuing Country | passportCountry | Country that issued the document |
| Gender | gender | "M" or "F" if visible |
| Place of Birth | cityOfBirth | City/place of birth if visible |

## RULES
1. Extract ONLY what is clearly visible on the document. Do NOT guess.
2. Convert country codes to full names: "JAM" → "Jamaica", "MEX" → "Mexico", "GBR" → "United Kingdom", "AZE" → "Azerbaijan", etc.
3. Convert all dates to YYYY-MM-DD format.
4. Names should be in proper case: "HARRISON" → "Harrison", "JOHN PAUL" → "John Paul".
5. If the document is not a passport/ID or is unreadable, return {"error": "Could not read document"}.
6. Return ONLY the JSON object. No explanation, no markdown.

## EXAMPLE OUTPUT
{"firstName":"Kemar","lastName":"Campbell","middleName":"Anthony","dateOfBirth":"1990-03-05","countryOfBirth":"Jamaica","countryOfCitizenship":"Jamaica","passportNumber":"A1234567","passportExpiry":"2028-06-15","passportCountry":"Jamaica","cityOfBirth":"Kingston","gender":"M"}`;

// ============================================================================
// Value sanitizer
// ============================================================================

function sanitizeValue(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return value
    .replace(/<[^>]*>/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

// ============================================================================
// Base64 data URL validator
// ============================================================================

function isValidImageDataUrl(url: string): boolean {
  return /^data:image\/(jpeg|jpg|png|gif|webp|bmp|tiff);base64,/.test(url);
}

// ============================================================================
// Handler
// ============================================================================

export async function POST(request: NextRequest) {
  // 1. Extract client IP for rate limiting
  const ip = getClientIp(request.headers);

  // 2. Rate limit check
  if (limiter.isLimited(ip)) {
    return Response.json(
      { success: false, error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  // 3. Validate API key early
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("[passport-ocr] OPENROUTER_API_KEY not set");
    return Response.json(
      { success: false, error: "OCR service is not configured" },
      { status: 500 }
    );
  }

  // 4. Parse and validate request body
  let image: string;

  try {
    const body = await request.json();
    image = body.image;
  } catch {
    return Response.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!image || typeof image !== "string") {
    return Response.json(
      { success: false, error: "No image provided" },
      { status: 400 }
    );
  }

  // 5. Validate image format
  if (!isValidImageDataUrl(image)) {
    return Response.json(
      { success: false, error: "Invalid image format. Expected a base64 data URL (data:image/...)." },
      { status: 400 }
    );
  }

  // 6. Validate image size
  if (image.length > MAX_BASE64_LENGTH) {
    return Response.json(
      { success: false, error: "Image too large. Maximum size is 10MB." },
      { status: 400 }
    );
  }

  console.log("[passport-ocr] Processing document image, size:", Math.round(image.length / 1024), "KB");

  // 7. Call OpenRouter with multimodal message
  let openrouterResponse: Response;

  try {
    openrouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://advantagenys.com",
          "X-Title": "ITIN Passport OCR",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: PASSPORT_OCR_PROMPT },
            {
              role: "user",
              content: [
                { type: "text", text: "Extract all fields from this passport/ID document." },
                { type: "image_url", image_url: { url: image } },
              ],
            },
          ],
          temperature: 0,
          max_tokens: 1000,
          response_format: { type: "json_object" },
        }),
      }
    );
  } catch (err) {
    console.error("[passport-ocr] Fetch error:", err);
    return Response.json(
      { success: false, error: "Failed to reach AI service" },
      { status: 502 }
    );
  }

  if (!openrouterResponse.ok) {
    const errorText = await openrouterResponse.text().catch(() => "");
    console.error(
      "[passport-ocr] OpenRouter error:",
      openrouterResponse.status,
      errorText
    );
    return Response.json(
      { success: false, error: "AI service unavailable" },
      { status: 502 }
    );
  }

  // 8. Parse LLM response
  let rawContent: string;

  try {
    const json = await openrouterResponse.json();
    rawContent = json?.choices?.[0]?.message?.content ?? "";
  } catch {
    return Response.json(
      { success: false, error: "Could not read document" },
      { status: 500 }
    );
  }

  if (!rawContent || typeof rawContent !== "string") {
    return Response.json(
      { success: false, error: "Could not read document" },
      { status: 500 }
    );
  }

  // 9. Parse JSON from content (strip markdown fences if present despite response_format)
  let extracted: Record<string, unknown>;

  try {
    const cleaned = rawContent
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    extracted = JSON.parse(cleaned);
  } catch {
    console.error("[passport-ocr] Failed to parse LLM JSON:", rawContent.slice(0, 500));
    return Response.json(
      { success: false, error: "Could not read document" },
      { status: 500 }
    );
  }

  if (typeof extracted !== "object" || extracted === null || Array.isArray(extracted)) {
    return Response.json(
      { success: false, error: "Could not read document" },
      { status: 500 }
    );
  }

  // 10. Check if LLM returned an error (unreadable document)
  if (typeof extracted.error === "string") {
    return Response.json(
      { success: false, error: extracted.error },
      { status: 200 }
    );
  }

  // 11. Filter to allowed fields only, sanitize values
  const fields: Record<string, string> = {};

  for (const [key, value] of Object.entries(extracted)) {
    if (!ALLOWED_FIELDS.has(key)) continue;
    const sanitized = sanitizeValue(value);
    if (sanitized && sanitized.length > 0) {
      fields[key] = sanitized;
    }
  }

  console.log(
    "[passport-ocr] Extracted fields:",
    Object.keys(fields).join(", ")
  );

  return Response.json({
    success: true,
    fields,
  });
}
