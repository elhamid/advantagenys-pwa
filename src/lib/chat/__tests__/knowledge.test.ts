import { describe, it, expect, vi, beforeEach } from "vitest";
import type { KnowledgeEntry } from "../knowledge";

// ============================================================================
// Mutable supabase reference (controlled via vi.hoisted so it exists at mock time)
// ============================================================================

const { mockOrder, mockEqIsActive, mockSelect, mockFrom, getSupabaseRef, setSupabaseRef } =
  vi.hoisted(() => {
    const mockOrder = vi.fn();
    const mockEqIsActive = vi.fn();
    const mockSelect = vi.fn();
    const mockFrom = vi.fn();

    let _supabaseRef: { from: typeof mockFrom } | null = { from: mockFrom };

    return {
      mockOrder,
      mockEqIsActive,
      mockSelect,
      mockFrom,
      getSupabaseRef: () => _supabaseRef,
      setSupabaseRef: (val: { from: typeof mockFrom } | null) => {
        _supabaseRef = val;
      },
    };
  });

vi.mock("@/lib/taskboard-supabase", () => ({
  get taskboardSupabase() {
    return getSupabaseRef();
  },
}));

// ============================================================================
// Fixture data
// ============================================================================

const taxEntry: KnowledgeEntry = {
  id: "1",
  title: "Tax Preparation",
  content: "We handle federal and state tax returns.",
  category: "service",
  keywords: ["tax", "taxes", "tax return", "federal tax"],
  service_slug: "tax",
  is_active: true,
};

const bookkeepingEntry: KnowledgeEntry = {
  id: "2",
  title: "Bookkeeping Services",
  content: "Monthly bookkeeping for small businesses.",
  category: "faq",
  keywords: ["bookkeeping", "accounting", "books"],
  service_slug: "bookkeeping",
  is_active: true,
};

const formLinkEntry: KnowledgeEntry = {
  id: "3",
  title: "ITIN Registration Form",
  content: "https://advantagenys.com/resources/forms/itin",
  category: "form_link",
  keywords: ["itin", "form"],
  service_slug: "tax",
  is_active: true,
};

const insuranceFaqEntry: KnowledgeEntry = {
  id: "4",
  title: "General Liability FAQ",
  content: "General liability insurance protects your business.",
  category: "faq",
  keywords: ["insurance", "liability"],
  service_slug: "insurance",
  is_active: true,
};

const ALL_ENTRIES = [taxEntry, bookkeepingEntry, formLinkEntry, insuranceFaqEntry];

// ============================================================================
// findRelevantKnowledge
// ============================================================================

describe("findRelevantKnowledge", () => {
  let findRelevantKnowledge: (q: string) => Promise<KnowledgeEntry[]>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Ensure supabase client is non-null
    setSupabaseRef({ from: mockFrom });

    // Default chain for loadAllActive: from().select().eq().order()
    mockOrder.mockResolvedValue({ data: ALL_ENTRIES, error: null });
    mockEqIsActive.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEqIsActive });
    mockFrom.mockReturnValue({ select: mockSelect });

    // Reset module cache to clear the in-memory _cache variable
    vi.resetModules();
    const mod = await import("../knowledge");
    findRelevantKnowledge = mod.findRelevantKnowledge;
  });

  it("returns entries that match the query keywords", async () => {
    const results = await findRelevantKnowledge("I need help with taxes");
    expect(results.length).toBeGreaterThan(0);
    const titles = results.map((r) => r.title);
    expect(titles).toContain("Tax Preparation");
  });

  it("returns empty array when no entries match", async () => {
    const results = await findRelevantKnowledge("xyzzywhateverunknown");
    expect(results).toEqual([]);
  });

  it("returns at most 5 results", async () => {
    // Bust cache and inject 7-entry dataset
    const manyEntries = Array.from({ length: 7 }, (_, i) => ({
      ...taxEntry,
      id: String(i + 10),
      title: `Tax Entry ${i}`,
      keywords: ["tax", "taxes"],
    }));
    mockOrder.mockResolvedValue({ data: manyEntries, error: null });
    vi.resetModules();
    const { findRelevantKnowledge: fn } = await import("../knowledge");
    const results = await fn("taxes");
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it("returns empty array when DB fetch fails", async () => {
    mockOrder.mockResolvedValue({ data: null, error: { message: "DB error" } });
    vi.resetModules();
    const { findRelevantKnowledge: fn } = await import("../knowledge");
    const results = await fn("taxes");
    expect(results).toEqual([]);
  });

  it("returns empty array when taskboardSupabase is null", async () => {
    setSupabaseRef(null);
    vi.resetModules();
    const { findRelevantKnowledge: fn } = await import("../knowledge");
    const results = await fn("taxes");
    expect(results).toEqual([]);
    // Restore
    setSupabaseRef({ from: mockFrom });
  });

  it("uses cache on second call (no second DB hit)", async () => {
    const hitsBefore = mockOrder.mock.calls.length;
    await findRelevantKnowledge("taxes");
    const hitsAfterFirst = mockOrder.mock.calls.length;
    expect(hitsAfterFirst).toBe(hitsBefore + 1); // one DB hit

    await findRelevantKnowledge("bookkeeping");
    expect(mockOrder.mock.calls.length).toBe(hitsAfterFirst); // no additional DB hit
  });

  it("matches bookkeeping keyword", async () => {
    const results = await findRelevantKnowledge("I need bookkeeping services");
    const titles = results.map((r) => r.title);
    expect(titles).toContain("Bookkeeping Services");
  });

  it("handles empty query without throwing", async () => {
    await expect(findRelevantKnowledge("")).resolves.toEqual([]);
  });
});

// ============================================================================
// getFAQsByService
// ============================================================================

describe("getFAQsByService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setSupabaseRef({ from: mockFrom });
  });

  it("returns FAQs for the given service slug", async () => {
    // getFAQsByService: from().select().eq(category).eq(service_slug).eq(is_active).order()
    const mockOrderFaq = vi.fn().mockResolvedValue({ data: [bookkeepingEntry], error: null });
    const mockEqActive2 = vi.fn().mockReturnValue({ order: mockOrderFaq });
    const mockEqSlug = vi.fn().mockReturnValue({ eq: mockEqActive2 });
    const mockEqCat = vi.fn().mockReturnValue({ eq: mockEqSlug });
    mockSelect.mockReturnValue({ eq: mockEqCat });
    mockFrom.mockReturnValue({ select: mockSelect });

    vi.resetModules();
    const { getFAQsByService } = await import("../knowledge");
    const results = await getFAQsByService("bookkeeping");
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns empty array on DB error", async () => {
    const mockOrderFaq = vi.fn().mockResolvedValue({ data: null, error: { message: "fail" } });
    const mockEqActive2 = vi.fn().mockReturnValue({ order: mockOrderFaq });
    const mockEqSlug = vi.fn().mockReturnValue({ eq: mockEqActive2 });
    const mockEqCat = vi.fn().mockReturnValue({ eq: mockEqSlug });
    mockSelect.mockReturnValue({ eq: mockEqCat });
    mockFrom.mockReturnValue({ select: mockSelect });

    vi.resetModules();
    const { getFAQsByService } = await import("../knowledge");
    const results = await getFAQsByService("insurance");
    expect(results).toEqual([]);
  });

  it("returns empty array when taskboardSupabase is null", async () => {
    setSupabaseRef(null);
    vi.resetModules();
    const { getFAQsByService } = await import("../knowledge");
    const results = await getFAQsByService("tax");
    expect(results).toEqual([]);
    setSupabaseRef({ from: mockFrom });
  });
});

// ============================================================================
// getFormLinks
// ============================================================================

describe("getFormLinks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setSupabaseRef({ from: mockFrom });
  });

  it("returns entries with category form_link", async () => {
    // getFormLinks: from().select().eq(category).eq(is_active).order()
    const mockOrderLinks = vi.fn().mockResolvedValue({ data: [formLinkEntry], error: null });
    const mockEqActive2 = vi.fn().mockReturnValue({ order: mockOrderLinks });
    const mockEqCat = vi.fn().mockReturnValue({ eq: mockEqActive2 });
    mockSelect.mockReturnValue({ eq: mockEqCat });
    mockFrom.mockReturnValue({ select: mockSelect });

    vi.resetModules();
    const { getFormLinks } = await import("../knowledge");
    const results = await getFormLinks();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].category).toBe("form_link");
  });

  it("returns empty array on DB error", async () => {
    const mockOrderLinks = vi.fn().mockResolvedValue({ data: null, error: { message: "fail" } });
    const mockEqActive2 = vi.fn().mockReturnValue({ order: mockOrderLinks });
    const mockEqCat = vi.fn().mockReturnValue({ eq: mockEqActive2 });
    mockSelect.mockReturnValue({ eq: mockEqCat });
    mockFrom.mockReturnValue({ select: mockSelect });

    vi.resetModules();
    const { getFormLinks } = await import("../knowledge");
    const results = await getFormLinks();
    expect(results).toEqual([]);
  });

  it("returns empty array when taskboardSupabase is null", async () => {
    setSupabaseRef(null);
    vi.resetModules();
    const { getFormLinks } = await import("../knowledge");
    const results = await getFormLinks();
    expect(results).toEqual([]);
    setSupabaseRef({ from: mockFrom });
  });

  it("returns empty array when no form_link entries exist", async () => {
    const mockOrderLinks = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockEqActive2 = vi.fn().mockReturnValue({ order: mockOrderLinks });
    const mockEqCat = vi.fn().mockReturnValue({ eq: mockEqActive2 });
    mockSelect.mockReturnValue({ eq: mockEqCat });
    mockFrom.mockReturnValue({ select: mockSelect });

    vi.resetModules();
    const { getFormLinks } = await import("../knowledge");
    const results = await getFormLinks();
    expect(results).toEqual([]);
  });
});
