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
import {
  calculateQualification,
  QualificationResult,
} from "@/lib/chat/qualification";

// ============================================================================
// Rate limiters — module-level singletons (persist across requests in same instance)
// ============================================================================

const minuteLimiter = createRateLimiter(15, 60_000); // 15 messages/min
const hourLimiter = createRateLimiter(100, 3_600_000); // 100 messages/hour

// ============================================================================
// Lead webhook — fire-and-forget when qualification threshold is reached
// ============================================================================

interface SimpleMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Build a concise conversation summary from the user messages.
 * Used as the required `summary` field in the taskboard webhook payload.
 */
function buildSummary(messages: SimpleMessage[]): string {
  const userMessages = messages.filter((m) => m.role === "user");
  if (userMessages.length === 0) return "Web chat inquiry — no user messages recorded.";
  // Take the last 3 user messages as the summary
  const excerpts = userMessages.slice(-3).map((m) => m.content.trim());
  return `Web chat inquiry: ${excerpts.join(" / ")}`.slice(0, 500);
}

/**
 * Extract name, phone, email from conversation text using simple heuristics.
 * These are best-effort; the webhook treats them all as optional.
 */
function extractContactInfo(messages: SimpleMessage[]): {
  name?: string;
  phone?: string;
  email?: string;
} {
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");

  const nameMatch = userText.match(
    /(?:my\s+name\s+is|me\s+llamo|i\s+am|i'm|soy)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
  );
  const phoneMatch = userText.match(/\b(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})\b/);
  const emailMatch = userText.match(/\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/);

  return {
    name: nameMatch?.[1]?.trim(),
    phone: phoneMatch?.[1]?.replace(/[^\d+]/g, ""),
    email: emailMatch?.[0]?.toLowerCase(),
  };
}

async function sendLeadToTaskboard(
  messages: SimpleMessage[],
  qualification: QualificationResult,
  pageContext?: string
): Promise<void> {
  const webhookUrl = process.env.TASKBOARD_WEBHOOK_URL;
  const apiKey = process.env.WEBCHAT_API_KEY;

  if (!webhookUrl || !apiKey) {
    console.warn(
      "[chat] TASKBOARD_WEBHOOK_URL or WEBCHAT_API_KEY not set — skipping lead webhook"
    );
    return;
  }

  const contact = extractContactInfo(messages);
  const summary = buildSummary(messages);

  const payload = {
    summary,
    messages,
    score: qualification.score,
    level: qualification.level,
    ...(contact.name ? { name: contact.name } : {}),
    ...(contact.phone ? { phone: contact.phone } : {}),
    ...(contact.email ? { email: contact.email } : {}),
    ...(qualification.detectedService ? { service: qualification.detectedService } : {}),
    ...(pageContext ? { pageContext } : {}),
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(
      `[chat] lead webhook responded ${response.status}: ${text}`
    );
  } else {
    console.log(
      `[chat] lead webhook accepted — score=${qualification.score} level=${qualification.level}`
    );
  }
}

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

  // 7. Build messages array for OpenRouter (last 15 messages, all user messages sanitized)
  const apiMessages = [
    { role: "system", content: fullSystemPrompt },
    ...messages.slice(-15).map((m, i) => ({
      role: m.role,
      content:
        m.role === "user"
          ? (i === messages.slice(-15).length - 1
              ? sanitized
              : sanitizeInput(m.content) || "")
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
          model: "anthropic/claude-sonnet-4.5",
          messages: apiMessages,
          stream: true,
          temperature: 0.7,
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

        // Fire-and-forget: send qualified lead to taskboard when threshold reached
        if (qualification.shouldHandoff) {
          sendLeadToTaskboard(qualMessages, qualification, pageContext).catch(
            (err) => console.error("[chat] lead webhook error:", err)
          );
        }
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
