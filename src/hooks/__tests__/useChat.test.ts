import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useChat } from "../useChat";

// ---------------------------------------------------------------------------
// Helpers for ReadableStream SSE simulation
// ---------------------------------------------------------------------------

function makeSSEStream(lines: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const line of lines) {
        controller.enqueue(encoder.encode(line));
      }
      controller.close();
    },
  });
}

function makeDeltaLine(content: string): string {
  return `data: ${JSON.stringify({
    choices: [{ delta: { content } }],
  })}\n`;
}

function makeQualificationLine(
  qual: object
): string {
  return `data: ${JSON.stringify({ qualification: qual })}\n`;
}

function makeOkResponse(stream: ReadableStream): Response {
  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/event-stream" },
  });
}

function makeErrorResponse(message: string, status = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useChat", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    it("starts with empty messages array", () => {
      const { result } = renderHook(() => useChat());
      expect(result.current.messages).toEqual([]);
    });

    it("starts with isLoading false", () => {
      const { result } = renderHook(() => useChat());
      expect(result.current.isLoading).toBe(false);
    });

    it("starts with null error", () => {
      const { result } = renderHook(() => useChat());
      expect(result.current.error).toBeNull();
    });

    it("starts with null qualification", () => {
      const { result } = renderHook(() => useChat());
      expect(result.current.qualification).toBeNull();
    });

    it("exposes sendMessage and clearMessages functions", () => {
      const { result } = renderHook(() => useChat());
      expect(typeof result.current.sendMessage).toBe("function");
      expect(typeof result.current.clearMessages).toBe("function");
    });
  });

  describe("sendMessage — message creation", () => {
    it("adds user message and empty assistant placeholder immediately", async () => {
      const stream = makeSSEStream(["data: [DONE]\n"]);
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        makeOkResponse(stream)
      );

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      const messages = result.current.messages;
      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe("user");
      expect(messages[0].content).toBe("Hello");
      expect(messages[1].role).toBe("assistant");
    });

    it("trims whitespace from user input", async () => {
      const stream = makeSSEStream(["data: [DONE]\n"]);
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        makeOkResponse(stream)
      );

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage("  Hello World  ");
      });

      expect(result.current.messages[0].content).toBe("Hello World");
    });

    it("does nothing when content is blank", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage("   ");
      });

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(result.current.messages).toHaveLength(0);
    });
  });

  describe("SSE stream parsing", () => {
    it("populates assistant message content from stream deltas", async () => {
      const stream = makeSSEStream([
        makeDeltaLine("Hello "),
        makeDeltaLine("world!"),
        "data: [DONE]\n",
      ]);
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        makeOkResponse(stream)
      );

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage("Hi");
      });

      const assistant = result.current.messages.find(
        (m) => m.role === "assistant"
      );
      expect(assistant?.content).toBe("Hello world!");
    });

    it("skips [DONE] sentinel without error", async () => {
      const stream = makeSSEStream([
        makeDeltaLine("Done test"),
        "data: [DONE]\n",
      ]);
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        makeOkResponse(stream)
      );

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage("test");
      });

      expect(result.current.error).toBeNull();
    });

    it("skips malformed JSON chunks without crashing", async () => {
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encoder.encode("data: {not valid json}\n"));
          controller.enqueue(encoder.encode(makeDeltaLine("valid ")));
          controller.enqueue(encoder.encode("data: [DONE]\n"));
          controller.close();
        },
      });
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        makeOkResponse(stream)
      );

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage("test");
      });

      const assistant = result.current.messages.find(
        (m) => m.role === "assistant"
      );
      expect(assistant?.content).toBe("valid ");
      expect(result.current.error).toBeNull();
    });

    it("accumulates multiple delta chunks into single assistant message", async () => {
      const chunks = ["A", "B", "C", "D", "E"];
      const stream = makeSSEStream([
        ...chunks.map(makeDeltaLine),
        "data: [DONE]\n",
      ]);
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        makeOkResponse(stream)
      );

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage("accumulate");
      });

      const assistant = result.current.messages.find(
        (m) => m.role === "assistant"
      );
      expect(assistant?.content).toBe("ABCDE");
    });
  });

  describe("qualification parsing", () => {
    it("sets qualification state from SSE qualification event", async () => {
      const qual = {
        score: 65,
        level: "hot",
        shouldHandoff: false,
        detectedService: "tax",
      };
      const stream = makeSSEStream([
        makeQualificationLine(qual),
        "data: [DONE]\n",
      ]);
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        makeOkResponse(stream)
      );

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage("I need tax help");
      });

      expect(result.current.qualification).toEqual(qual);
    });

    it("sets qualification with qualified level", async () => {
      const qual = {
        score: 80,
        level: "qualified",
        shouldHandoff: true,
        detectedService: "formation",
      };
      const stream = makeSSEStream([
        makeQualificationLine(qual),
        "data: [DONE]\n",
      ]);
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        makeOkResponse(stream)
      );

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage("Start my LLC");
      });

      expect(result.current.qualification?.level).toBe("qualified");
      expect(result.current.qualification?.shouldHandoff).toBe(true);
    });
  });

  describe("error handling", () => {
    it("sets error message on non-OK response", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        makeErrorResponse("Service unavailable")
      );

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage("test");
      });

      expect(result.current.error).toBe("Service unavailable");
    });

    it("removes empty assistant message on error", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        makeErrorResponse("Something went wrong")
      );

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage("test");
      });

      // User message should remain; empty assistant placeholder should be removed
      const messages = result.current.messages;
      expect(messages).toHaveLength(1);
      expect(messages[0].role).toBe("user");
    });

    it("sets isLoading false after error", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        makeErrorResponse("Server error")
      );

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage("test");
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("handles fetch network failure gracefully", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
        new Error("Network error")
      );

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage("test");
      });

      expect(result.current.error).toBe("Network error");
      expect(result.current.isLoading).toBe(false);
    });

    it("clears previous error on new message send", async () => {
      // First call fails
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(makeErrorResponse("First error"))
        .mockResolvedValueOnce(makeOkResponse(makeSSEStream(["data: [DONE]\n"])));

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage("first");
      });
      expect(result.current.error).toBe("First error");

      await act(async () => {
        await result.current.sendMessage("second");
      });
      // Error should be cleared at start of second send
      expect(result.current.error).toBeNull();
    });
  });

  describe("clearMessages", () => {
    it("resets messages to empty array", async () => {
      const stream = makeSSEStream([makeDeltaLine("reply"), "data: [DONE]\n"]);
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        makeOkResponse(stream)
      );

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage("Hello");
      });
      expect(result.current.messages.length).toBeGreaterThan(0);

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toHaveLength(0);
    });

    it("resets error to null", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        makeErrorResponse("Some error")
      );

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage("test");
      });
      expect(result.current.error).toBe("Some error");

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.error).toBeNull();
    });

    it("resets qualification to null", async () => {
      const qual = { score: 65, level: "hot", shouldHandoff: false };
      const stream = makeSSEStream([
        makeQualificationLine(qual),
        "data: [DONE]\n",
      ]);
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        makeOkResponse(stream)
      );

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage("need tax help");
      });
      expect(result.current.qualification).not.toBeNull();

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.qualification).toBeNull();
    });
  });

  describe("pageContext", () => {
    it("passes pageContext in fetch body", async () => {
      const stream = makeSSEStream(["data: [DONE]\n"]);
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(makeOkResponse(stream));

      const { result } = renderHook(() => useChat("/services/tax-services"));

      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      const [, options] = fetchSpy.mock.calls[0];
      const body = JSON.parse((options as RequestInit).body as string);
      expect(body.pageContext).toBe("/services/tax-services");
    });
  });
});
