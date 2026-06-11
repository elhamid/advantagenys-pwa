import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "../route";

describe("GET /api/careers/product-engineering-associate/exchange-rate", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the latest USD/INR reference rate", async () => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        amount: 1,
        base: "USD",
        date: "2026-06-08",
        rates: { INR: 95.71 },
      }),
    } as Response));

    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      base: "USD",
      quote: "INR",
      rate: 95.71,
      date: "2026-06-08",
    });
  });
});
