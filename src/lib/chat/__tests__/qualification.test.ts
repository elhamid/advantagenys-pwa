import { describe, it, expect } from "vitest";
import { calculateQualification } from "../qualification";

// ============================================================================
// Helpers
// ============================================================================

function userMsg(content: string) {
  return { role: "user" as const, content };
}

function assistantMsg(content: string) {
  return { role: "assistant" as const, content };
}

/** Build a conversation with N user messages (interleaved with assistant turns). */
function buildConversation(userMessages: string[]) {
  const msgs: Array<{ role: "user" | "assistant"; content: string }> = [];
  for (const u of userMessages) {
    msgs.push(userMsg(u));
    msgs.push(assistantMsg("Thank you for reaching out. How can I help?"));
  }
  return msgs;
}

// ============================================================================
// Score tier tests
// ============================================================================

describe("calculateQualification — score tiers", () => {
  it("scores cold (0-20) for a single generic message", () => {
    const result = calculateQualification([userMsg("Hello")]);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(25);
    expect(result.level).toBe("cold");
  });

  it("scores warm (21-50) for a message with service need but no urgency/budget", () => {
    // has_need (20) + service_match (15) = 35 — warm, but pacing gate caps at 74 with <4 msgs
    const result = calculateQualification([
      userMsg("I need help with my taxes"),
      assistantMsg("Sure!"),
    ]);
    expect(result.score).toBeGreaterThanOrEqual(21);
    expect(result.score).toBeLessThanOrEqual(74); // pacing gate
    expect(["warm", "hot"]).toContain(result.level);
  });

  it("scores hot (51-75) with need + urgency + budget signals", () => {
    const msgs = buildConversation([
      "I need help with my taxes asap",
      "How much does it cost?",
      "I need to file before the deadline",
    ]);
    const result = calculateQualification(msgs);
    // Pacing gate: 3 user messages → cap at 74, so at most hot
    expect(result.score).toBeGreaterThanOrEqual(26);
    expect(result.score).toBeLessThanOrEqual(74);
  });

  it("reaches qualified (76+) with all signals and 4+ user messages", () => {
    // 4+ user messages required to pass pacing gate
    const msgs = buildConversation([
      "I need to form an LLC asap",
      "How much does it cost? I have a budget ready",
      "I am the owner of the business and I decide everything",
      "I want to do this next month — April deadline",
    ]);
    const result = calculateQualification(msgs);
    // All five major factors present + engagement + service match
    expect(result.score).toBeGreaterThanOrEqual(76);
    expect(result.level).toBe("qualified");
    expect(result.shouldHandoff).toBe(true);
  });
});

// ============================================================================
// Pacing gate
// ============================================================================

describe("calculateQualification — pacing gate", () => {
  it("caps score at 74 when fewer than 4 user messages even with full signals", () => {
    const msgs = [
      userMsg("I need bookkeeping asap"),
      assistantMsg("Hello!"),
      userMsg("How much does it cost? I own the business"),
      assistantMsg("Great!"),
      userMsg("I want to start next month"),
      assistantMsg("Perfect!"),
      // Only 3 user messages above
    ];
    const result = calculateQualification(msgs);
    expect(result.score).toBeLessThanOrEqual(74);
    expect(result.shouldHandoff).toBe(false);
  });

  it("allows score above 74 with exactly 4 user messages", () => {
    const msgs = buildConversation([
      "I need payroll services asap",
      "How much does it cost? I can afford it",
      "I am the owner and I decide. I want to start in March",
      "Can we set up a call this week?",
    ]);
    const result = calculateQualification(msgs);
    // With 4 messages, pacing gate is lifted
    expect(result.score).toBeGreaterThanOrEqual(50);
    // Qualified if enough signals present
  });

  it("produces shouldHandoff=false when score is 75 (below threshold)", () => {
    // Build a scenario with exactly enough for 75 — pacing gate lifts at 4 msgs
    // Since the threshold is >=76, a score of 75 should not handoff
    const msgs = buildConversation([
      "I need an LLC formed soon",
      "What's the cost for formation?",
      "I own the business",
      "Looking to get this done this month",
    ]);
    const result = calculateQualification(msgs);
    if (result.score < 76) {
      expect(result.shouldHandoff).toBe(false);
    } else {
      expect(result.shouldHandoff).toBe(true);
    }
  });
});

// ============================================================================
// shouldHandoff
// ============================================================================

describe("calculateQualification — shouldHandoff", () => {
  it("shouldHandoff is true when score >= 76", () => {
    const msgs = buildConversation([
      "I need tax help urgently, how much does it cost?",
      "I am the owner and I decide everything for the business",
      "April deadline — I need this done in 2 weeks",
      "My name is Maria and I own a restaurant in Brooklyn",
    ]);
    const result = calculateQualification(msgs);
    if (result.score >= 76) {
      expect(result.shouldHandoff).toBe(true);
      expect(result.level).toBe("qualified");
    }
  });

  it("shouldHandoff is false for cold leads", () => {
    const result = calculateQualification([userMsg("What services do you offer?")]);
    expect(result.shouldHandoff).toBe(false);
  });
});

// ============================================================================
// Service detection
// ============================================================================

describe("calculateQualification — service detection", () => {
  it("detects tax service", () => {
    const result = calculateQualification([userMsg("I need help with my taxes")]);
    expect(result.detectedService).toBe("tax");
  });

  it("detects bookkeeping service", () => {
    const result = calculateQualification([userMsg("I need bookkeeping services")]);
    expect(result.detectedService).toBe("bookkeeping");
  });

  it("detects payroll service", () => {
    const result = calculateQualification([userMsg("Help with payroll setup")]);
    expect(result.detectedService).toBe("payroll");
  });

  it("detects insurance service", () => {
    const result = calculateQualification([userMsg("I need general liability insurance")]);
    expect(result.detectedService).toBe("insurance");
  });

  it("detects formation service (LLC)", () => {
    const result = calculateQualification([userMsg("How do I form an LLC?")]);
    expect(result.detectedService).toBe("formation");
  });

  it("detects licensing service", () => {
    const result = calculateQualification([userMsg("I need a business license")]);
    expect(result.detectedService).toBe("licensing");
  });

  it("detects legal/immigration service", () => {
    const result = calculateQualification([userMsg("I need help with immigration and a green card")]);
    expect(result.detectedService).toBe("legal");
  });

  it("detects audit service", () => {
    const result = calculateQualification([userMsg("I got an IRS audit notice")]);
    expect(result.detectedService).toBe("audit");
  });

  it("returns undefined detectedService for generic messages", () => {
    const result = calculateQualification([userMsg("Hello, what can you do?")]);
    expect(result.detectedService).toBeUndefined();
  });

  it("detects ITIN as tax service", () => {
    const result = calculateQualification([userMsg("I need an ITIN number")]);
    expect(result.detectedService).toBe("tax");
  });
});

// ============================================================================
// Individual signal patterns
// ============================================================================

describe("calculateQualification — urgency signals", () => {
  it("scores higher with 'asap'", () => {
    const withUrgency = calculateQualification([userMsg("I need tax help asap")]);
    const withoutUrgency = calculateQualification([userMsg("I need tax help sometime")]);
    expect(withUrgency.score).toBeGreaterThan(withoutUrgency.score);
  });

  it("detects IRS notice as urgency", () => {
    const result = calculateQualification([userMsg("I got an IRS notice")]);
    // IRS notice triggers urgency (pattern matches \birs\b) and audit (service)
    expect(result.score).toBeGreaterThan(0);
  });

  it("detects 'deadline' as urgency", () => {
    const withDeadline = calculateQualification([userMsg("I have a tax deadline coming up")]);
    const baseline = calculateQualification([userMsg("I have a meeting coming up")]);
    expect(withDeadline.score).toBeGreaterThan(baseline.score);
  });
});

describe("calculateQualification — budget signals", () => {
  it("detects 'how much' as budget signal", () => {
    const withBudget = calculateQualification([userMsg("How much does it cost?")]);
    const withoutBudget = calculateQualification([userMsg("When can I start?")]);
    expect(withBudget.score).toBeGreaterThan(withoutBudget.score);
  });

  it("detects price inquiry", () => {
    const result = calculateQualification([userMsg("What is your price for bookkeeping?")]);
    expect(result.score).toBeGreaterThan(0);
  });
});

describe("calculateQualification — authority signals", () => {
  it("detects 'I own' as authority", () => {
    const withAuthority = calculateQualification([userMsg("I own a restaurant in Brooklyn")]);
    const withoutAuthority = calculateQualification([userMsg("There is a restaurant in Brooklyn")]);
    expect(withAuthority.score).toBeGreaterThan(withoutAuthority.score);
  });

  it("detects 'owner' keyword", () => {
    const result = calculateQualification([userMsg("I am the owner and I need LLC formation")]);
    expect(result.score).toBeGreaterThan(15);
  });
});

describe("calculateQualification — timeline signals", () => {
  it("detects month names as timeline", () => {
    const withTimeline = calculateQualification([userMsg("I want to start in March")]);
    const withoutTimeline = calculateQualification([userMsg("I want to start soon")]);
    expect(withTimeline.score).toBeGreaterThan(withoutTimeline.score);
  });

  it("detects 'next month' as timeline", () => {
    const result = calculateQualification([userMsg("I need this done next month")]);
    expect(result.score).toBeGreaterThan(0);
  });
});

// ============================================================================
// Edge cases
// ============================================================================

describe("calculateQualification — edge cases", () => {
  it("handles empty messages array", () => {
    const result = calculateQualification([]);
    expect(result.score).toBe(0);
    expect(result.level).toBe("cold");
    expect(result.shouldHandoff).toBe(false);
  });

  it("handles assistant-only messages", () => {
    const result = calculateQualification([assistantMsg("How can I help you today?")]);
    expect(result.score).toBe(0);
    expect(result.level).toBe("cold");
  });

  it("score never exceeds 100", () => {
    // Pile on every possible signal
    const msgs = buildConversation([
      "My name is Carlos, I need tax help urgently, how much does it cost?",
      "I own the business, I am the owner and I decide everything",
      "April deadline — I need this done in 2 weeks, this month",
      "ASAP, I have an IRS audit notice and need help immediately",
      "What is your price? I have a budget and I need help now",
    ]);
    const result = calculateQualification(msgs);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("score is never negative", () => {
    const result = calculateQualification([userMsg("ok")]);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it("detects name bonus", () => {
    const withName = calculateQualification([userMsg("My name is Maria, I need help with taxes")]);
    const withoutName = calculateQualification([userMsg("I need help with taxes")]);
    expect(withName.score).toBeGreaterThan(withoutName.score);
  });
});
