// /api/itin-voice — Structured data extraction from ITIN voice transcripts.
// Uses a dedicated extraction-only prompt (no conversational AI personality).

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
// Extraction prompt — built per-request so today's date is always current
// ============================================================================

function buildExtractionPrompt(): string {
  const today = new Date().toISOString().split("T")[0];
  return `You are a structured data extraction engine. Your ONLY job is to extract ITIN application fields from a speech transcript and return a JSON object.

Today's date is ${today}.

## FIELDS TO EXTRACT

| Field | Type | Extraction Rules |
|-------|------|-----------------|
| firstName | string | First/given name |
| lastName | string | Last/family/surname |
| middleName | string | Middle name. "no middle name" or "none" → "N/A" |
| dateOfBirth | string | Format: YYYY-MM-DD. "March 5th 1990" → "1990-03-05" |
| countryOfBirth | string | Full country name. "I'm from Azerbaijan" → "Azerbaijan" |
| cityOfBirth | string | Birth city |
| countryOfCitizenship | string | Usually same as countryOfBirth unless stated otherwise |
| phone | string | Any phone number |
| email | string | Any email address |
| companyName | string | Employer name |
| city | string | Appointment city. Map: "New York"/"NYC" → "new_york", "Nashville" → "nashville" |
| addressUsa | string | Full US street address with number, street, city, state |
| homeCountry | string | Non-US home country. When someone says "I'm from [country]", set this too |
| homeCity | string | City in home country |
| homeAddress | string | Street address in home country — any non-US address details |
| usEntryDate | string | US entry date as YYYY-MM-DD. "September 10 2023" → "2023-09-10". Use today's date to resolve relative dates like "last year" or "last March" |
| amount | string | Annual earnings as digits only. "27,500" → "27500", "twenty-seven thousand" → "27000" |
| passportNumber | string | Passport number |
| passportExpiry | string | Passport expiry as YYYY-MM-DD |
| passportCountry | string | Passport issuing country |

## RULES

1. Extract EVERY field mentioned or reasonably inferable.
2. When someone says "I'm from [country]" or mentions a country, set countryOfBirth, countryOfCitizenship, AND homeCountry to that country (unless they explicitly differentiate).
3. A city name immediately after a country name is likely both cityOfBirth and homeCity. Example: "Azerbaijan Baku" → homeCountry: "Azerbaijan", homeCity: "Baku", countryOfBirth: "Azerbaijan", cityOfBirth: "Baku"
4. Any address-like string (street name + number) that is NOT a US address goes into homeAddress. Foreign addresses often use format "[Name/Street] [Number]". Example: "Imran Gasimov 16" → homeAddress: "Imran Gasimov 16"
5. If passportCountry is set but countryOfBirth is not, default countryOfBirth and countryOfCitizenship to passportCountry.
6. Convert spoken numbers to digits: "twenty-seven thousand five hundred" → "27500"
7. Convert all dates to YYYY-MM-DD format. Use today's date for relative references.
8. Strip commas from amounts: "27,500" → "27500"
9. PHONE NUMBERS: Speech-to-text often breaks phone numbers into separate digit groups. Reassemble them into a proper phone number. Examples: "3 47 4403592" → "347-440-3592", "nine two nine 5 5 5 0123" → "929-555-0123", "347 440 3592" → "347-440-3592". Look for ANY sequence of digits/digit-groups near words like "phone", "number", "call", "cell", "mobile" and combine into a US phone number (XXX-XXX-XXXX format).
10. EMAILS: Speech-to-text may duplicate or garble domains. Clean them: "gmailgmail.com" → "gmail.com", "at gmail dot com" → "@gmail.com", "yahooYahoo.com" → "yahoo.com". Fix obvious speech-to-text artifacts.
11. WORDS RUN TOGETHER: Speech-to-text may join words without spaces. "HarrisonBorn" means "Harrison" + "Born". Separate them and extract both parts.
12. Only include fields where you found data. Do NOT include empty or null fields.
13. Return ONLY the JSON object. No explanation, no markdown, no code fences.

## EXAMPLES

### Example 1
Transcript: "My name is Maria Lopez, born on March 5th 1990 in Mexico City Mexico. I entered the US on January 15 2022. I live at 456 Oak Avenue Brooklyn New York. My home address in Mexico is Calle Reforma 23. I make about thirty-five thousand a year."
Output: {"firstName":"Maria","lastName":"Lopez","dateOfBirth":"1990-03-05","cityOfBirth":"Mexico City","countryOfBirth":"Mexico","countryOfCitizenship":"Mexico","homeCountry":"Mexico","homeCity":"Mexico City","homeAddress":"Calle Reforma 23","usEntryDate":"2022-01-15","addressUsa":"456 Oak Avenue, Brooklyn, New York","amount":"35000"}

### Example 2
Transcript: "8148 256th St. entered September 10, 2023 I'm from Azerbaijan Baku home address is Imran Gasimov 16 annual earnings 27,500"
Output: {"addressUsa":"8148 256th St.","usEntryDate":"2023-09-10","countryOfBirth":"Azerbaijan","countryOfCitizenship":"Azerbaijan","homeCountry":"Azerbaijan","homeCity":"Baku","cityOfBirth":"Baku","homeAddress":"Imran Gasimov 16","amount":"27500"}

### Example 3
Transcript: "Juan Carlos Martinez no middle name born July 20 1985 I'm from Guatemala passport number G12345678 expires March 15 2027 working at Tony's Pizzeria making twenty thousand a year phone 929-555-0123"
Output: {"firstName":"Juan Carlos","lastName":"Martinez","middleName":"N/A","dateOfBirth":"1985-07-20","countryOfBirth":"Guatemala","countryOfCitizenship":"Guatemala","homeCountry":"Guatemala","passportNumber":"G12345678","passportExpiry":"2027-03-15","passportCountry":"Guatemala","companyName":"Tony's Pizzeria","amount":"20000","phone":"929-555-0123"}

### Example 4 (garbled speech-to-text — phone broken into digit groups, email domain doubled, words joined)
Transcript: "Harry HarrisonBorn on September 10, 1981 in Baku Azerbaijan Azerbaijan citizen number is 3 47 4403592 email Hamid.genius@gmailgmail.com"
Output: {"firstName":"Harry","lastName":"Harrison","dateOfBirth":"1981-09-10","cityOfBirth":"Baku","countryOfBirth":"Azerbaijan","countryOfCitizenship":"Azerbaijan","phone":"347-440-3592","email":"Hamid.genius@gmail.com"}`;
}

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

  // 6. Call OpenRouter with dedicated extraction prompt
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
          "X-Title": "ITIN Voice Extraction",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: buildExtractionPrompt() },
            { role: "user", content: userMessage },
          ],
          stream: false,
          temperature: 0,
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

  // 7. Parse LLM response
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
