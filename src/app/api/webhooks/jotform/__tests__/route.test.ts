import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { NextRequest } from "next/server";
import { GET, POST } from "../route";

const originalSecret = process.env.JOTFORM_WEBHOOK_SECRET;

function buildRequest(body: string, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/webhooks/jotform", {
    method: "POST",
    headers,
    body,
  }) as unknown as NextRequest;
}

beforeEach(() => {
  process.env.JOTFORM_WEBHOOK_SECRET = "test-jotform-secret";
});

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.JOTFORM_WEBHOOK_SECRET;
  } else {
    process.env.JOTFORM_WEBHOOK_SECRET = originalSecret;
  }
});

describe("/api/webhooks/jotform", () => {
  it("rejects requests with the wrong webhook secret", async () => {
    const response = await POST(
      buildRequest("rawRequest={}", {
        "content-type": "application/x-www-form-urlencoded",
        "x-jotform-webhook-secret": "wrong-secret",
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("rejects requests missing the secret header when secret is configured (fail-closed)", async () => {
    const response = await POST(
      buildRequest("rawRequest={}", {
        "content-type": "application/x-www-form-urlencoded",
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("skips verification when JOTFORM_WEBHOOK_SECRET is not configured (local dev)", async () => {
    delete process.env.JOTFORM_WEBHOOK_SECRET;

    const response = await POST(
      buildRequest(
        JSON.stringify({
          formID: "form-dev",
          submissionID: "submission-dev",
          answers: {},
        }),
        { "content-type": "application/json" }
      )
    );

    expect(response.status).toBe(200);
  });

  it("parses a rawRequest payload and returns the structured response", async () => {
    const submission = {
      formID: "form-1",
      submissionID: "submission-1",
      formTitle: "Lead Capture",
      answers: {
        "1": {
          name: "Full Name",
          text: "Full Name",
          answer: "Test User",
          type: "control_textbox",
        },
      },
    };

    const response = await POST(
      buildRequest(`rawRequest=${encodeURIComponent(JSON.stringify(submission))}`, {
        "content-type": "application/x-www-form-urlencoded",
        "x-jotform-webhook-secret": "test-jotform-secret",
      })
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      success: true,
      formID: "form-1",
      submissionID: "submission-1",
    });
  });

  it("falls back to direct JSON parsing when rawRequest is absent", async () => {
    const response = await POST(
      buildRequest(
        JSON.stringify({
          formID: "form-2",
          submissionID: "submission-2",
          answers: {},
        }),
        {
          "content-type": "application/json",
          "x-jotform-webhook-secret": "test-jotform-secret",
        }
      )
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.formID).toBe("form-2");
    expect(body.submissionID).toBe("submission-2");
  });

  it("returns 400 for invalid payloads", async () => {
    const response = await POST(
      buildRequest("not-json", {
        "content-type": "application/x-www-form-urlencoded",
        "x-jotform-webhook-secret": "test-jotform-secret",
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid payload: could not parse submission data",
    });
  });

  it("returns basic status information from GET", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.endpoint).toBe("JotForm Webhook");
  });
});
