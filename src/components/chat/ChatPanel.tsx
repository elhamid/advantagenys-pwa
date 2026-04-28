"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "./ChatMessage";
import { chatMessageSent } from "@/lib/analytics/events";
import { ContactChip } from "./ContactChip";

interface ChatPanelProps {
  pageContext: string;
  onClose: () => void;
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-[var(--bg)] rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ChatPanel({ pageContext, onClose }: ChatPanelProps) {
  const { messages, isLoading, error, qualification, sendMessage, clearMessages } =
    useChat(pageContext);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    chatMessageSent();
    sendMessage(input.trim());
    setInput("");
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="mb-4 w-[calc(100vw-2rem)] sm:w-[380px] rounded-[var(--radius-lg)] bg-[var(--surface)] shadow-[var(--shadow-lg)] border border-[var(--border)] overflow-hidden flex flex-col"
      style={{ maxHeight: "500px" }}
    >
      {/* Header — gradient bar with title + anchored ContactChip rail */}
      <div
        className="px-4 py-3 flex items-center justify-between shrink-0"
        style={{ background: "var(--gradient-primary)" }}
      >
        {/* Title block */}
        <div>
          <h3 className="text-white font-semibold text-sm">Ava</h3>
          <p className="text-xs text-slate-300">Your AI assistant</p>
        </div>

        {/* Right side: contact chip rail + utility controls */}
        <div className="flex items-center gap-2">
          {/* Persistent glass-pill contact actions — anchored in chrome, never in message stream */}
          <ContactChip />

          {/* Divider */}
          <span className="w-px h-5 bg-white/20 shrink-0" aria-hidden="true" />

          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="text-slate-300 hover:text-white transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Clear chat"
              title="Clear chat"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              </svg>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close chat"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-[var(--text-muted)]">
              Hi! I&apos;m <strong className="text-[var(--text-secondary)]">Ava</strong>, your AI assistant.
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Ask me about our services, pricing, or how we can help your
              business.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}

        {isLoading &&
          messages[messages.length - 1]?.content === "" && (
            <TypingIndicator />
          )}

        <div ref={messagesEndRef} />
      </div>

      {/* Qualification CTA */}
      {qualification &&
        (qualification.level === "hot" || qualification.level === "qualified") && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mx-3 mb-2 rounded-xl border border-[var(--blue-accent)] bg-blue-50/60 dark:bg-blue-950/30 px-3 py-2.5 shrink-0"
          >
            <p className="text-xs font-semibold text-[var(--blue-accent)] mb-2">
              Ready to get started?
            </p>
            <div className="flex gap-2">
              <Link
                href="/book"
                onClick={onClose}
                className="flex-1 text-center text-xs font-medium py-1.5 rounded-lg text-white transition-all active:scale-95"
                style={{ background: "var(--blue-accent)" }}
              >
                Book Consultation
              </Link>
              <a
                href="tel:+19299331396"
                className="flex-1 text-center text-xs font-medium py-1.5 rounded-lg border border-[var(--blue-accent)] text-[var(--blue-accent)] transition-all active:scale-95"
              >
                Call (929) 933-1396
              </a>
            </div>
          </motion.div>
        )}

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 shrink-0">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-3 py-3 border-t border-[var(--border)] flex gap-2 shrink-0"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          maxLength={500}
          className="flex-1 px-3 py-2 text-sm rounded-full bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] outline-none focus:border-[var(--blue-accent)] focus:ring-1 focus:ring-[var(--blue-accent)] transition-colors disabled:opacity-50 placeholder:text-[var(--text-muted)]"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 transition-all disabled:opacity-40 active:scale-95"
          style={{ background: "var(--blue-accent)" }}
          aria-label="Send message"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </motion.div>
  );
}
