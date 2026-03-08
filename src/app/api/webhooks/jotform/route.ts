import { NextRequest, NextResponse } from "next/server";

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

    // Structure the parsed data
    const structured = {
      formID: submission.formID,
      submissionID: submission.submissionID,
      formTitle: submission.formTitle || "Unknown Form",
      receivedAt: new Date().toISOString(),
      answerCount: Object.keys(submission.answers).length,
      answers: Object.entries(submission.answers).reduce(
        (acc, [key, value]) => {
          if (value && value.answer) {
            acc[key] = {
              field: value.name || value.text || `field_${key}`,
              value: value.prettyFormat || value.answer,
              type: value.type,
            };
          }
          return acc;
        },
        {} as Record<string, { field: string; value: string | Record<string, string>; type: string }>
      ),
    };

    // Log structured data (will be replaced with DB storage later)
    console.log("[JotForm Webhook]", JSON.stringify(structured, null, 2));

    return NextResponse.json({
      success: true,
      formID: structured.formID,
      submissionID: structured.submissionID,
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
