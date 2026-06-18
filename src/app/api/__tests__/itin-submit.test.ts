import { describe, it, expect, vi } from "vitest";
const { uploadMultipleItinDocuments } = vi.hoisted(() => ({
  uploadMultipleItinDocuments: vi.fn(),
}));

vi.mock("@/lib/itin-storage", () => ({
  uploadMultipleItinDocuments,
}));

vi.mock("@/lib/rate-limit", () => ({
  createRateLimiter: vi.fn(() => ({
    isLimited: vi.fn().mockReturnValue(false),
    remaining: vi.fn().mockReturnValue(4),
    max: 5,
    windowMs: 60_000,
    label: "api/itin-submit",
    reset: vi.fn(),
  })),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn(),
    }),
  },
}));

import { POST } from "../itin-submit/route";

describe("POST /api/itin-submit", () => {
  it("is retired and does not write legacy public ITIN documents", async () => {
    const response = await POST();

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining("/resources/forms/itin-registration-form"),
    });
    expect(uploadMultipleItinDocuments).not.toHaveBeenCalled();
  });
});
