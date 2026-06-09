import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { NextRequest } from "next/server";
import { POST } from "../route";

const originalSecret = process.env.JOTFORM_WEBHOOK_SECRET;
const originalPwaSecret = process.env.PWA_WEBHOOK_SECRET;
const originalTaskboardUrl = process.env.TASKBOARD_WEBHOOK_URL;

function buildRequest(body: string, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/webhooks/jotform", {
    method: "POST",
    headers,
    body,
  }) as unknown as NextRequest;
}

beforeEach(() => {
  process.env.JOTFORM_WEBHOOK_SECRET = "test-jotform-secret";
  process.env.PWA_WEBHOOK_SECRET = "test-pwa-secret";
  process.env.TASKBOARD_WEBHOOK_URL = "https://taskboard.test/api/webhooks/pwa-lead";
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ success: true }), { status: 201 }))
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalSecret === undefined) {
    delete process.env.JOTFORM_WEBHOOK_SECRET;
  } else {
    process.env.JOTFORM_WEBHOOK_SECRET = originalSecret;
  }
  if (originalPwaSecret === undefined) {
    delete process.env.PWA_WEBHOOK_SECRET;
  } else {
    process.env.PWA_WEBHOOK_SECRET = originalPwaSecret;
  }
  if (originalTaskboardUrl === undefined) {
    delete process.env.TASKBOARD_WEBHOOK_URL;
  } else {
    process.env.TASKBOARD_WEBHOOK_URL = originalTaskboardUrl;
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
      taskboardForwarded: true,
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
    expect(body.taskboardForwarded).toBe(true);
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

  it("forwards normalized JotForm submissions to the Taskboard PWA lead webhook", async () => {
    const submission = {
      formID: "253426701953054",
      submissionID: "submission-forward",
      formTitle: "Contractor License Qualifier",
      answers: {
        "1": {
          name: "Full Name",
          text: "Full Name",
          answer: "Sam Builder",
          type: "control_fullname",
        },
        "2": {
          name: "Phone",
          text: "Phone",
          answer: "+17185551212",
          type: "control_phone",
        },
        "3": {
          name: "Email",
          text: "Email",
          answer: "sam@example.com",
          type: "control_email",
        },
        "4": {
          name: "shared_by",
          text: "shared_by",
          answer: "staff-zia",
          type: "control_hidden",
        },
        "5": {
          name: "utm_medium",
          text: "utm_medium",
          answer: "staff_share",
          type: "control_hidden",
        },
      },
    };

    const response = await POST(
      buildRequest(`rawRequest=${encodeURIComponent(JSON.stringify(submission))}`, {
        "content-type": "application/x-www-form-urlencoded",
        "x-jotform-webhook-secret": "test-jotform-secret",
      })
    );

    expect(response.status).toBe(200);
    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://taskboard.test/api/webhooks/pwa-lead",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pwa-secret": "test-pwa-secret",
        },
      })
    );

    const payload = JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string);
    expect(payload).toMatchObject({
      type: "contact",
      fullName: "Sam Builder",
      phone: "+17185551212",
      email: "sam@example.com",
      source: "website-home-improvement",
      sharedBy: "staff-zia",
      services: ["Licensing"],
      utm: {
        utm_medium: "staff_share",
      },
    });
  });


});
