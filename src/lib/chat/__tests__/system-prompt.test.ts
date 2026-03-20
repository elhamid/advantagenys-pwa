import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================================
// Mutable supabase reference — use vi.hoisted so it exists before vi.mock factories
// ============================================================================

const { mockSingle, mockEq, mockSelect, mockFrom, getSupabaseRef, setSupabaseRef } =
  vi.hoisted(() => {
    const mockSingle = vi.fn();
    const mockEq = vi.fn();
    const mockSelect = vi.fn();
    const mockFrom = vi.fn();

    let _ref: { from: typeof mockFrom } | null = { from: mockFrom };

    return {
      mockSingle,
      mockEq,
      mockSelect,
      mockFrom,
      getSupabaseRef: () => _ref,
      setSupabaseRef: (val: { from: typeof mockFrom } | null) => {
        _ref = val;
      },
    };
  });

vi.mock("@/lib/taskboard-supabase", () => ({
  get taskboardSupabase() {
    return getSupabaseRef();
  },
}));

// ============================================================================
// Tests
// ============================================================================

describe("getSystemPrompt", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    setSupabaseRef({ from: mockFrom });

    // Default chain: from().select().eq().single() → success
    mockSingle.mockResolvedValue({ data: { value: "DB prompt content" }, error: null });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    // Reset module to clear the in-memory _cached variable between tests
    vi.resetModules();
  });

  it("returns DB prompt when fetch succeeds", async () => {
    const { getSystemPrompt } = await import("../system-prompt");
    const result = await getSystemPrompt();
    expect(result).toContain("DB prompt content");
  });

  it("appends web-specific additions to the base prompt", async () => {
    const { getSystemPrompt } = await import("../system-prompt");
    const result = await getSystemPrompt();
    expect(result).toContain("advantagenys.com");
    expect(result).toContain("(929) 933-1396");
    expect(result).toContain("concise");
  });

  it("injects pageContext when provided", async () => {
    const { getSystemPrompt } = await import("../system-prompt");
    const result = await getSystemPrompt("Tax Services page");
    expect(result).toContain("Tax Services page");
    expect(result).toContain("currently viewing:");
  });

  it("does not include pageContext line when omitted", async () => {
    const { getSystemPrompt } = await import("../system-prompt");
    const result = await getSystemPrompt();
    expect(result).not.toContain("currently viewing:");
  });

  it("falls back to default prompt when DB returns an error", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "DB error" } });
    const { getSystemPrompt } = await import("../system-prompt");
    const result = await getSystemPrompt();
    expect(result).toContain("Ava");
    expect(result).toContain("Advantage Business Consulting");
  });

  it("falls back to default prompt when DB returns no value", async () => {
    mockSingle.mockResolvedValue({ data: { value: null }, error: null });
    const { getSystemPrompt } = await import("../system-prompt");
    const result = await getSystemPrompt();
    expect(result).toContain("Ava");
  });

  it("falls back to default prompt when DB throws", async () => {
    mockSingle.mockRejectedValue(new Error("network timeout"));
    const { getSystemPrompt } = await import("../system-prompt");
    const result = await getSystemPrompt();
    expect(result).toContain("Ava");
    expect(result).toContain("Advantage Business Consulting");
  });

  it("uses in-memory cache on second call (no second DB hit)", async () => {
    const { getSystemPrompt } = await import("../system-prompt");

    // First call — populates cache
    await getSystemPrompt();
    const callsAfterFirst = mockSingle.mock.calls.length;

    // Second call — should use cache
    await getSystemPrompt();
    expect(mockSingle.mock.calls.length).toBe(callsAfterFirst);
  });
});

// ============================================================================
// Null taskboardSupabase
// ============================================================================

describe("getSystemPrompt — null Supabase client", () => {
  it("returns default prompt when taskboardSupabase is null", async () => {
    vi.clearAllMocks();
    setSupabaseRef(null);
    vi.resetModules();

    const { getSystemPrompt } = await import("../system-prompt");
    const result = await getSystemPrompt();
    expect(result).toContain("Ava");
    expect(result).toContain("Advantage Business Consulting");
    expect(result).toContain("advantagenys.com");

    // Restore
    setSupabaseRef({ from: mockFrom });
  });
});
