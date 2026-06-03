import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { NextRequest } from "next/server";
import { GET, POST } from "../route";

const originalSecret = process.env.JOTFORM_API_KEY;
const originalPwaSecret = process.env.PWA_WEBHOOK_SECRET;
const originalTaskboardUrl = process.env.TASKBOARD_WEBHOOK_URL;
const originalVercelEnv = process.env.VERCEL_ENV;

function buildRequest(body: string, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/webhooks/jotform", {
    method: "POST",
    headers,
    body,
  }) as unknown as NextRequest;
}

beforeEach(() => {
  process.env.JOTFORM_API_KEY = "test-jotform-secret";
  process.env.PWA_WEBHOOK_SECRET = "test-pwa-secret";
  process.env.TASKBOARD_WEBHOOK_URL = "https://taskboard.test/api/webhooks/pwa-lead";
  delete process.env.VERCEL_ENV;
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ success: true, taskId: "task-1" }), { status: 201 }))
  );
});

afterEach(() => {
  process.env.JOTFORM_API_KEY = originalSecret;
  process.env.PWA_WEBHOOK_SECRET = originalPwaSecret;
  process.env.TASKBOARD_WEBHOOK_URL = originalTaskboardUrl;
  process.env.VERCEL_ENV = originalVercelEnv;
  vi.unstubAllGlobals();
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
      taskboardForwarded: true,
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://taskboard.test/api/webhooks/pwa-lead",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pwa-secret": "test-pwa-secret",
        },
      })
    );
    const forwardedBody = JSON.parse((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(forwardedBody).toMatchObject({
      fullName: "Test User",
      phone: "jotform:submission-1",
      source: "jotform-webhook",
      serviceType: "Business Consulting",
    });
    expect(forwardedBody.metadata.raw.formID).toBe("form-1");
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
    expect(body.taskboardForwarded).toBe(true);
  });

  it("returns 502 in production when taskboard forwarding fails", async () => {
    process.env.VERCEL_ENV = "production";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("bad secret", { status: 401 }))
    );

    const response = await POST(
      buildRequest(
        JSON.stringify({
          formID: "230235945738159",
          submissionID: "submission-3",
          formTitle: "Tax Return Questionnaire",
          answers: {
            "1": {
              name: "Full Name",
              text: "Full Name",
              answer: "Tax Client",
              type: "control_textbox",
            },
            "2": {
              name: "Phone",
              text: "Phone",
              answer: "+15550001212",
              type: "control_phone",
            },
          },
        }),
        {
          "content-type": "application/json",
          "x-jotform-webhook-secret": "test-jotform-secret",
        }
      )
    );

    await expect(response.json()).resolves.toEqual({
      error: "Taskboard webhook failed",
      formID: "230235945738159",
      submissionID: "submission-3",
    });
    expect(response.status).toBe(502);
  });

  it("returns 400 for invalid payloads", async () => {
    const response = await POST(
      buildRequest("not-json", {
        "content-type": "application/x-www-form-urlencoded",
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
