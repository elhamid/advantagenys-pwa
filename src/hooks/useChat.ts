"use client";

import { useState, useCallback, useRef } from "react";
import type { QualificationResult } from "@/lib/chat/qualification";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function useChat(pageContext?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qualification, setQualification] = useState<QualificationResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setError(null);

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: content.trim(),
      };
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsLoading(true);

      try {
        abortRef.current = new AbortController();

        const allMessages = [...messages, userMsg];
        const apiMessages = allMessages.slice(-15).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, pageContext }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const err = await res
            .json()
            .catch(() => ({ error: "Failed to connect" }));
          throw new Error(err.error || "Failed to get response");
        }

        // Parse SSE stream from OpenRouter
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let accumulated = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Keep the last potentially incomplete line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);

                // Qualification event from our route handler
                if (parsed.qualification) {
                  setQualification(parsed.qualification as QualificationResult);
                  continue;
                }

                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  accumulated += delta;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsg.id
                        ? { ...m, content: accumulated }
                        : m
                    )
                  );
                }
              } catch {
                // Skip malformed JSON chunks
              }
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        const errorMessage =
          err instanceof Error ? err.message : "Something went wrong";
        setError(errorMessage);
        // Remove the empty assistant message on error
        setMessages((prev) => prev.filter((m) => m.id !== assistantMsg.id));
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [messages, isLoading, pageContext]
  );

  const clearMessages = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setQualification(null);
  }, []);

  return { messages, isLoading, error, qualification, sendMessage, clearMessages };
}
