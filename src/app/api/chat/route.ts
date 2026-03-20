// /api/chat — Streaming chat endpoint for Ava AI web chat
// Uses OpenRouter with SSE streaming, knowledge base RAG, and security layers.

import { NextRequest } from "next/server";
import {
  createRateLimiter,
  containsPromptInjection,
  sanitizeInput,
} from "@/lib/chat/security";
import { getSystemPrompt } from "@/lib/chat/system-prompt";
import { findRelevantKnowledge } from "@/lib/chat/knowledge";
import { calculateQualification } from "@/lib/chat/qualification";

// ============================================================================
// Rate limiters — module-level singletons (persist across requests in same instance)
// ============================================================================

const minuteLimiter = createRateLimiter(15, 60_000); // 15 messages/min
const hourLimiter = createRateLimiter(100, 3_600_000); // 100 messages/hour

// ============================================================================
// Handler
// ============================================================================

export async function POST(request: NextRequest) {
  // 1. Extract client IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // 2. Rate limit check (both per-minute and per-hour)
  if (minuteLimiter.isLimited(ip) || hourLimiter.isLimited(ip)) {
    return Response.json(
      { error: "Too many messages. Please wait a moment." },
      { status: 429 }
    );
  }

  // 3. Parse request body
  let messages: Array<{ role: string; content: string }>;
  let pageContext: string | undefined;

  try {
    const body = await request.json();
    messages = body.messages;
    pageContext = body.pageContext;

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Messages required." }, { status: 400 });
    }
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  // 4. Sanitize the latest user message + injection check
  const lastMessage = messages[messages.length - 1]?.content || "";
  const sanitized = sanitizeInput(lastMessage);

  if (!sanitized) {
    return Response.json({ error: "Empty message." }, { status: 400 });
  }

  if (containsPromptInjection(sanitized)) {
    return Response.json({ error: "Invalid input." }, { status: 400 });
  }

  // 5. Fetch relevant knowledge for RAG context
  const knowledge = await findRelevantKnowledge(sanitized);
  const knowledgeContext = knowledge
    .map((k) => `[${k.title}]: ${k.content}`)
    .join("\n");

  // 6. Build system prompt with web context + knowledge
  const systemPrompt = await getSystemPrompt(pageContext);
  const fullSystemPrompt = knowledgeContext
    ? `${systemPrompt}\n\nRelevant knowledge:\n${knowledgeContext}`
    : systemPrompt;

  // 7. Build messages array for OpenRouter (last 15 messages, sanitized latest)
  const apiMessages = [
    { role: "system", content: fullSystemPrompt },
    ...messages.slice(-15).map((m, i) => ({
      role: m.role,
      content:
        m.role === "user" && i === messages.slice(-15).length - 1
          ? sanitized
          : m.content,
    })),
  ];

  // 8. Check for API key
  if (!process.env.OPENROUTER_API_KEY) {
    return Response.json(
      { error: "AI service not configured." },
      { status: 503 }
    );
  }

  // 9. Call OpenRouter with streaming
  try {
    const openrouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://advantagenys.com",
          "X-Title": "Advantage Services",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: apiMessages,
          stream: true,
          temperature: 0.3,
          max_tokens: 400,
        }),
      }
    );

    if (!openrouterResponse.ok) {
      console.error(
        "[chat] OpenRouter error:",
        openrouterResponse.status,
        await openrouterResponse.text().catch(() => "")
      );
      return Response.json(
        { error: "AI service unavailable. Please try again." },
        { status: 502 }
      );
    }

    // 10. Stream through SSE, then append qualification event
    const upstreamBody = openrouterResponse.body;
    if (!upstreamBody) {
      return Response.json({ error: "Empty upstream response." }, { status: 502 });
    }

    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Run the pipe + qualification in the background (fire-and-forget)
    (async () => {
      try {
        const reader = upstreamBody.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }

        // After upstream ends, calculate qualification from conversation
        const qualMessages = messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
        const qualification = calculateQualification(qualMessages);
        const qualEvent = `data: ${JSON.stringify({ qualification })}\n\n`;
        await writer.write(encoder.encode(qualEvent));
        await writer.write(encoder.encode("data: [DONE]\n\n"));
      } catch (e) {
        console.error("[chat] stream pipe error:", e);
      } finally {
        writer.close().catch(() => {});
      }
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[chat] Fetch error:", err);
    return Response.json(
      { error: "Failed to reach AI service." },
      { status: 502 }
    );
  }
}
