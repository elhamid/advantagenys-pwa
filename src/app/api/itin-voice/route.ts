// /api/itin-voice — AVA voice-powered form fill for ITIN applications
// Accepts a speech transcript, extracts structured ITIN fields via OpenRouter (Gemini).

import { NextRequest } from "next/server";

// ============================================================================
// Rate limiter — simple in-memory, 10 requests per minute per IP
// ============================================================================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  if (entry.count >= 10) {
    return true;
  }

  entry.count++;
  return false;
}

// ============================================================================
// Allowed ITIN field keys — used to strip unknown keys from LLM response
// ============================================================================

const ALLOWED_FIELDS = new Set([
  "firstName",
  "lastName",
  "middleName",
  "dateOfBirth",
  "countryOfBirth",
  "cityOfBirth",
  "countryOfCitizenship",
  "phone",
  "email",
  "companyName",
  "city",
  "addressUsa",
  "homeCountry",
  "homeCity",
  "homeAddress",
  "usEntryDate",
  "amount",
  "passportNumber",
  "passportExpiry",
  "passportCountry",
]);

// ============================================================================
// System prompt
// ============================================================================

const SYSTEM_PROMPT = `You are a structured data extractor for ITIN (Individual Taxpayer Identification Number) applications.

Your task is to extract ITIN application fields from a speech transcript. Return ONLY a valid JSON object — no explanation, no markdown, no code fences.

Extractable fields (only include fields clearly mentioned in the transcript):
- firstName: Given/first name
- lastName: Family/last name
- middleName: Middle name (if explicitly stated)
- dateOfBirth: Date of birth in YYYY-MM-DD format (e.g. "March 5th 1990" → "1990-03-05")
- countryOfBirth: Full official country name (e.g. "Jamaica", "Haiti", "Mexico")
- cityOfBirth: City or town of birth
- countryOfCitizenship: Full official country name (often same as countryOfBirth)
- phone: Phone number with formatting (e.g. "929-555-0123")
- email: Email address (lowercase)
- companyName: Employer or company name
- city: Appointment city — MUST be exactly "new_york" or "nashville". Map "New York" or "NYC" → "new_york"; map "Nashville" or "Tennessee" → "nashville". Only include if appointment city is mentioned.
- addressUsa: Full US street address (street + city, e.g. "147 West 35th Street, New York")
- homeCountry: Full country name for home country address
- homeCity: City name in home country
- homeAddress: Street address in home country
- usEntryDate: US entry date in YYYY-MM-DD format
- amount: Annual earnings as numbers only (e.g. "45000"), no currency symbols
- passportNumber: Passport document number
- passportExpiry: Passport expiry date in YYYY-MM-DD format
- passportCountry: Full name of the country that issued the passport

Rules:
1. Extract ONLY fields clearly stated in the transcript. Do NOT guess or infer.
2. If a field is ambiguous or not mentioned, omit it entirely.
3. Convert all dates to YYYY-MM-DD format.
4. Use full official country names (not abbreviations).
5. For the "city" field, ONLY use "new_york" or "nashville" — no other values.
6. Preserve any existing values from currentFields unless the transcript explicitly overrides them.
7. Return a flat JSON object with string values only.`;

// ============================================================================
// Value sanitizer
// ============================================================================

function sanitizeValue(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  // Strip HTML tags, trim whitespace, collapse internal whitespace
  return value
    .replace(/<[^>]*>/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

// ============================================================================
// Handler
// ============================================================================

export async function POST(request: NextRequest) {
  // 1. Extract client IP for rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // 2. Rate limit check
  if (isRateLimited(ip)) {
    return Response.json(
      { success: false, error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  // 3. Validate API key early
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("[itin-voice] OPENROUTER_API_KEY not set");
    return Response.json(
      { success: false, error: "Voice assistant is not configured" },
      { status: 500 }
    );
  }

  // 4. Parse and validate request body
  let transcript: string;
  let currentFields: Record<string, string> = {};

  try {
    const body = await request.json();
    transcript = body.transcript;
    if (body.currentFields && typeof body.currentFields === "object") {
      currentFields = body.currentFields;
    }
  } catch {
    return Response.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!transcript || typeof transcript !== "string" || transcript.trim().length === 0) {
    return Response.json(
      { success: false, error: "No transcript provided" },
      { status: 400 }
    );
  }

  if (transcript.length > 5000) {
    return Response.json(
      { success: false, error: "Transcript exceeds maximum length of 5000 characters" },
      { status: 400 }
    );
  }

  const trimmedTranscript = transcript.trim();

  // 5. Build user message — include currentFields context so LLM preserves filled values
  const currentFieldsSummary =
    Object.keys(currentFields).length > 0
      ? `\n\nAlready filled fields (preserve unless transcript overrides):\n${JSON.stringify(currentFields, null, 2)}`
      : "";

  const userMessage = `Extract ITIN application fields from this transcript:

"${trimmedTranscript}"${currentFieldsSummary}`;

  console.log("[itin-voice] Processing transcript:", trimmedTranscript.slice(0, 200));

  // 6. Call OpenRouter
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
          "X-Title": "Advantage ITIN Voice",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
          stream: false,
          temperature: 0.1,
          max_tokens: 1000,
          response_format: { type: "json_object" },
        }),
      }
    );
  } catch (err) {
    console.error("[itin-voice] Fetch error:", err);
    return Response.json(
      { success: false, error: "Failed to reach AI service" },
      { status: 502 }
    );
  }

  if (!openrouterResponse.ok) {
    const errorText = await openrouterResponse.text().catch(() => "");
    console.error(
      "[itin-voice] OpenRouter error:",
      openrouterResponse.status,
      errorText
    );
    return Response.json(
      { success: false, error: "AI service unavailable" },
      { status: 502 }
    );
  }

  // 7. Parse the LLM response
  let rawContent: string;

  try {
    const json = await openrouterResponse.json();
    rawContent = json?.choices?.[0]?.message?.content ?? "";
  } catch {
    return Response.json(
      { success: false, error: "Could not extract information" },
      { status: 500 }
    );
  }

  if (!rawContent || typeof rawContent !== "string") {
    return Response.json(
      { success: false, error: "Could not extract information" },
      { status: 500 }
    );
  }

  // 8. Parse JSON from content (strip markdown fences if present despite response_format)
  let extracted: Record<string, unknown>;

  try {
    // Strip markdown code fences if the model included them anyway
    const cleaned = rawContent
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    extracted = JSON.parse(cleaned);
  } catch {
    console.error("[itin-voice] Failed to parse LLM JSON:", rawContent.slice(0, 500));
    return Response.json(
      { success: false, error: "Could not extract information" },
      { status: 500 }
    );
  }

  if (typeof extracted !== "object" || extracted === null || Array.isArray(extracted)) {
    return Response.json(
      { success: false, error: "Could not extract information" },
      { status: 500 }
    );
  }

  // 9. Filter to allowed fields only, sanitize values
  const fields: Record<string, string> = {};

  for (const [key, value] of Object.entries(extracted)) {
    if (!ALLOWED_FIELDS.has(key)) continue;
    const sanitized = sanitizeValue(value);
    if (sanitized && sanitized.length > 0) {
      fields[key] = sanitized;
    }
  }

  // 10. Assess confidence based on number of fields extracted
  const fieldCount = Object.keys(fields).length;
  const confidence: "high" | "medium" | "low" =
    fieldCount >= 5 ? "high" : fieldCount >= 2 ? "medium" : "low";

  console.log(
    "[itin-voice] Extracted fields:",
    Object.keys(fields).join(", "),
    `(confidence: ${confidence})`
  );

  return Response.json({
    success: true,
    fields,
    confidence,
  });
}
