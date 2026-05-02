import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// We need to test different env var states, so we re-import the module per test
// by using vi.resetModules(). For type-checking, define the shape we expect.

type BookingClientModule = typeof import("../booking-client");

function buildFetchMock(
  status: number,
  body: object,
  statusText = "OK"
): ReturnType<typeof vi.fn> {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: async () => body,
  });
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// BOOK_LIVE flag
// ---------------------------------------------------------------------------

describe("BOOK_LIVE flag", () => {
  it('is true when NEXT_PUBLIC_BOOK_LIVE is "true"', async () => {
    vi.stubEnv("NEXT_PUBLIC_BOOK_LIVE", "true");
    const mod: BookingClientModule = await import("../booking-client");
    expect(mod.BOOK_LIVE).toBe(true);
  });

  it("is false when NEXT_PUBLIC_BOOK_LIVE is undefined", async () => {
    vi.stubEnv("NEXT_PUBLIC_BOOK_LIVE", "");
    const mod: BookingClientModule = await import("../booking-client");
    expect(mod.BOOK_LIVE).toBe(false);
  });

  it('is false when NEXT_PUBLIC_BOOK_LIVE is "false"', async () => {
    vi.stubEnv("NEXT_PUBLIC_BOOK_LIVE", "false");
    const mod: BookingClientModule = await import("../booking-client");
    expect(mod.BOOK_LIVE).toBe(false);
  });

  it('is false when NEXT_PUBLIC_BOOK_LIVE is "TRUE" (case-sensitive)', async () => {
    vi.stubEnv("NEXT_PUBLIC_BOOK_LIVE", "TRUE");
    const mod: BookingClientModule = await import("../booking-client");
    expect(mod.BOOK_LIVE).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// BASE_URL fallback
// ---------------------------------------------------------------------------

describe("BASE_URL fallback", () => {
  it("defaults to https://app.advantagenys.com when env var not set", async () => {
    delete process.env.NEXT_PUBLIC_BOOK_API_BASE;
    vi.stubEnv("NEXT_PUBLIC_BOOK_LIVE", "true");
    const fetchSpy = buildFetchMock(200, { slots: [], assignee_initials: "" });
    vi.stubGlobal("fetch", fetchSpy);

    const mod: BookingClientModule = await import("../booking-client");
    await mod.fetchSlots({ service: "tax", from: "2026-05-01", to: "2026-05-07" });

    const url = fetchSpy.mock.calls[0][0] as string;
    expect(url).toContain("https://app.advantagenys.com/api/book/slots");
  });

  it("uses custom base URL from NEXT_PUBLIC_BOOK_API_BASE", async () => {
    vi.stubEnv("NEXT_PUBLIC_BOOK_API_BASE", "https://custom.example.com");
    vi.stubEnv("NEXT_PUBLIC_BOOK_LIVE", "true");
    const fetchSpy = buildFetchMock(200, { slots: [], assignee_initials: "" });
    vi.stubGlobal("fetch", fetchSpy);

    const mod: BookingClientModule = await import("../booking-client");
    await mod.fetchSlots({ service: "tax", from: "2026-05-01", to: "2026-05-07" });

    const url = fetchSpy.mock.calls[0][0] as string;
    expect(url).toContain("https://custom.example.com/api/book/slots");
  });
});

// ---------------------------------------------------------------------------
// fetchSlots
// ---------------------------------------------------------------------------

describe("fetchSlots", () => {
  it("parses a successful response with slots", async () => {
    delete process.env.NEXT_PUBLIC_BOOK_API_BASE;
    const mockSlots = {
      slots: [
        { start: "2026-05-02T14:00:00Z", end: "2026-05-02T14:20:00Z", assignee_user_id: "u1" },
        { start: "2026-05-02T14:30:00Z", end: "2026-05-02T14:50:00Z", assignee_user_id: "u1" },
      ],
      assignee_initials: "KP",
    };
    vi.stubGlobal("fetch", buildFetchMock(200, mockSlots));

    const mod: BookingClientModule = await import("../booking-client");
    const result = await mod.fetchSlots({ service: "tax", from: "2026-05-01", to: "2026-05-07" });

    expect(result.slots).toHaveLength(2);
    expect(result.slots[0].start).toBe("2026-05-02T14:00:00Z");
    expect(result.assignee_initials).toBe("KP");
  });

  it("constructs query params correctly (lowercases service)", async () => {
    delete process.env.NEXT_PUBLIC_BOOK_API_BASE;
    const fetchSpy = buildFetchMock(200, { slots: [], assignee_initials: "" });
    vi.stubGlobal("fetch", fetchSpy);

    const mod: BookingClientModule = await import("../booking-client");
    await mod.fetchSlots({ service: "TAX", from: "2026-05-01", to: "2026-05-07" });

    const rawUrl = fetchSpy.mock.calls[0][0] as string;
    const qs = rawUrl.split("?")[1] ?? "";
    const params = new URLSearchParams(qs);
    expect(params.get("service")).toBe("tax");
    expect(params.get("from")).toBe("2026-05-01");
    expect(params.get("to")).toBe("2026-05-07");
  });

  it("throws on non-200 response", async () => {
    delete process.env.NEXT_PUBLIC_BOOK_API_BASE;
    vi.stubGlobal("fetch", buildFetchMock(500, {}, "Internal Server Error"));

    const mod: BookingClientModule = await import("../booking-client");
    await expect(
      mod.fetchSlots({ service: "tax", from: "2026-05-01", to: "2026-05-07" })
    ).rejects.toThrow("Slots request failed: 500 Internal Server Error");
  });

  it("throws on network error", async () => {
    delete process.env.NEXT_PUBLIC_BOOK_API_BASE;
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const mod: BookingClientModule = await import("../booking-client");
    await expect(
      mod.fetchSlots({ service: "tax", from: "2026-05-01", to: "2026-05-07" })
    ).rejects.toThrow("Failed to fetch");
  });
});

// ---------------------------------------------------------------------------
// confirmBooking
// ---------------------------------------------------------------------------

describe("confirmBooking", () => {
  const baseArgs = {
    service: "TAX",
    slot_start: "2026-05-02T14:00:00Z",
    slot_end: "2026-05-02T14:20:00Z",
    name: "Jane Doe",
    email: "jane@example.com",
  };

  it("returns confirmation_id on 201 success", async () => {
    delete process.env.NEXT_PUBLIC_BOOK_API_BASE;
    vi.stubGlobal(
      "fetch",
      buildFetchMock(201, { confirmation_id: "abc-123" }, "Created")
    );

    const mod: BookingClientModule = await import("../booking-client");
    const result = await mod.confirmBooking(baseArgs);
    expect(result.confirmation_id).toBe("abc-123");
  });

  it("falls back to appointment_id when confirmation_id is absent", async () => {
    delete process.env.NEXT_PUBLIC_BOOK_API_BASE;
    vi.stubGlobal(
      "fetch",
      buildFetchMock(201, { appointment_id: "appt-456" }, "Created")
    );

    const mod: BookingClientModule = await import("../booking-client");
    const result = await mod.confirmBooking(baseArgs);
    expect(result.confirmation_id).toBe("appt-456");
  });

  it("throws Error when 201 but no ID returned", async () => {
    delete process.env.NEXT_PUBLIC_BOOK_API_BASE;
    vi.stubGlobal("fetch", buildFetchMock(201, {}, "Created"));

    const mod: BookingClientModule = await import("../booking-client");
    await expect(mod.confirmBooking(baseArgs)).rejects.toThrow(
      "Booking confirmed but no confirmation ID returned."
    );
  });

  it("throws SlotConflictError on 409 with alternatives", async () => {
    delete process.env.NEXT_PUBLIC_BOOK_API_BASE;
    const alternatives = [
      { start: "2026-05-02T15:00:00Z", end: "2026-05-02T15:20:00Z" },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        statusText: "Conflict",
        json: async () => ({ error: "Slot taken", alternatives }),
      })
    );

    const mod: BookingClientModule = await import("../booking-client");
    try {
      await mod.confirmBooking(baseArgs);
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(mod.SlotConflictError);
      const conflict = err as InstanceType<typeof mod.SlotConflictError>;
      expect(conflict.type).toBe("SlotConflictError");
      expect(conflict.alternatives).toHaveLength(1);
      expect(conflict.alternatives[0].start).toBe("2026-05-02T15:00:00Z");
      expect(conflict.message).toBe(
        "That time was just booked — pick another below."
      );
    }
  });

  it("throws SlotConflictError with empty alternatives when body parse fails on 409", async () => {
    delete process.env.NEXT_PUBLIC_BOOK_API_BASE;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        statusText: "Conflict",
        json: async () => {
          throw new Error("bad json");
        },
      })
    );

    const mod: BookingClientModule = await import("../booking-client");
    try {
      await mod.confirmBooking(baseArgs);
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(mod.SlotConflictError);
      const conflict = err as InstanceType<typeof mod.SlotConflictError>;
      expect(conflict.alternatives).toEqual([]);
    }
  });

  it("throws BookingValidationError on 400 with error message", async () => {
    delete process.env.NEXT_PUBLIC_BOOK_API_BASE;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({ error: "Name is required" }),
      })
    );

    const mod: BookingClientModule = await import("../booking-client");
    try {
      await mod.confirmBooking(baseArgs);
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(mod.BookingValidationError);
      const validation = err as InstanceType<typeof mod.BookingValidationError>;
      expect(validation.type).toBe("BookingValidationError");
      expect(validation.message).toBe("Name is required");
    }
  });

  it("throws BookingValidationError with default message when 400 body has no error field", async () => {
    delete process.env.NEXT_PUBLIC_BOOK_API_BASE;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({}),
      })
    );

    const mod: BookingClientModule = await import("../booking-client");
    try {
      await mod.confirmBooking(baseArgs);
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(mod.BookingValidationError);
      expect((err as Error).message).toBe("Invalid booking request.");
    }
  });

  it("throws generic Error on other non-201 status codes", async () => {
    delete process.env.NEXT_PUBLIC_BOOK_API_BASE;
    vi.stubGlobal("fetch", buildFetchMock(503, {}, "Service Unavailable"));

    const mod: BookingClientModule = await import("../booking-client");
    await expect(mod.confirmBooking(baseArgs)).rejects.toThrow(
      "Booking confirmation failed: 503 Service Unavailable"
    );
  });

  it("sends lowercased service and optional phone/notes", async () => {
    delete process.env.NEXT_PUBLIC_BOOK_API_BASE;
    const fetchSpy = buildFetchMock(201, { confirmation_id: "x" }, "Created");
    vi.stubGlobal("fetch", fetchSpy);

    const mod: BookingClientModule = await import("../booking-client");
    await mod.confirmBooking({
      ...baseArgs,
      phone: "9299331396",
      notes: "Need help with W-7",
    });

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body as string);
    expect(body.service).toBe("tax");
    expect(body.phone).toBe("9299331396");
    expect(body.notes).toBe("Need help with W-7");
  });

  it("omits phone and notes from body when not provided", async () => {
    delete process.env.NEXT_PUBLIC_BOOK_API_BASE;
    const fetchSpy = buildFetchMock(201, { confirmation_id: "x" }, "Created");
    vi.stubGlobal("fetch", fetchSpy);

    const mod: BookingClientModule = await import("../booking-client");
    await mod.confirmBooking(baseArgs);

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body as string);
    expect(body).not.toHaveProperty("phone");
    expect(body).not.toHaveProperty("notes");
  });
});
