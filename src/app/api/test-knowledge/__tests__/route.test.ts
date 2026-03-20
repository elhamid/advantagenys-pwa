import { describe, it, expect, vi } from "vitest";
import { GET } from "../route";

vi.mock("@/lib/chat/knowledge", () => ({
  findRelevantKnowledge: vi.fn().mockResolvedValue([
    { id: "k1", question: "What is an ITIN?", answer: "An IRS tax ID." },
    { id: "k2", question: "How do I form an LLC?", answer: "File with the state." },
  ]),
}));

describe("/api/test-knowledge", () => {
  it("returns the knowledge lookup results", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.count).toBe(2);
    expect(body.results).toHaveLength(2);
  });
});
