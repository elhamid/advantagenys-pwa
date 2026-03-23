// /api/itin-voice — AVA voice-powered form fill for ITIN applications
// Uses AVA's real system prompt + knowledge base from taskboard, with extraction instructions appended.

import { NextRequest } from "next/server";
import { getSystemPrompt } from "@/lib/chat/system-prompt";
import { findRelevantKnowledge } from "@/lib/chat/knowledge";

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
// ITIN extraction instructions (appended to AVA's real system prompt)
// ============================================================================

const EXTRACTION_INSTRUCTIONS = `

--- ITIN VOICE FILL MODE ---
You are currently helping a client fill out their ITIN application by voice. Extract application fields from their speech transcript and return ONLY a valid JSON object — no explanation, no markdown, no code fences.

Extractable fields (only include fields clearly mentioned):
- firstName, lastName, middleName (if they say "no middle name" or "none", set middleName to "N/A")
- dateOfBirth (YYYY-MM-DD format, e.g. "March 5th 1990" → "1990-03-05")
- countryOfBirth, cityOfBirth (full official country/city names)
- countryOfCitizenship (full official country name, often same as countryOfBirth)
- phone (any phone number mentioned), email
- companyName (employer)
- city (appointment city: MUST be exactly "new_york" or "nashville")
- addressUsa (full US street address — include street number, street name, city, state if mentioned)
- homeCountry (full country name for non-US home address)
- homeCity (city/town in home country)
- homeAddress (street address in home country — include all details mentioned, any non-US address)
- usEntryDate (when they entered the US — YYYY-MM-DD format. "January 2023" → "2023-01-01", "last year" → estimate)
- amount (annual earnings as a number string. "27,000" → "27000", "twenty-seven thousand" → "27000", "thirty-five thousand" → "35000". Convert spoken numbers to digits.)
- passportNumber, passportExpiry (YYYY-MM-DD), passportCountry

Rules:
1. Extract ALL fields that are mentioned or can be reasonably inferred from context. Be generous — if they mention an address that's clearly non-US, put it in homeAddress.
2. Convert all dates to YYYY-MM-DD. Use full country names.
3. Convert spoken numbers to digits (e.g., "twenty-seven thousand" → "27000").
4. For "city" field: map "New York"/"NYC" → "new_york", "Nashville" → "nashville".
5. If they mention a country name for where they're from, set BOTH countryOfBirth AND countryOfCitizenship to it (unless they explicitly differentiate).
6. Preserve existing currentFields unless transcript explicitly overrides.
7. Return flat JSON with string values only.`;

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

  // 6. Build AVA's system prompt (from taskboard DB) + extraction instructions
  const [avaPrompt, knowledge] = await Promise.all([
    getSystemPrompt("ITIN Application Kiosk — Voice Fill Mode"),
    findRelevantKnowledge("ITIN application passport tax immigrant"),
  ]);

  const knowledgeContext = knowledge.length > 0
    ? `\n\nRelevant knowledge:\n${knowledge.map((k) => `- ${k.title}: ${k.content}`).join("\n")}`
    : "";

  const fullSystemPrompt = avaPrompt + knowledgeContext + EXTRACTION_INSTRUCTIONS;

  // 7. Call OpenRouter with AVA's real identity
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
          "X-Title": "AVA ITIN Voice Fill",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: fullSystemPrompt },
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
