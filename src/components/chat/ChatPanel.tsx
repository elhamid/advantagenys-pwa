"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "./ChatMessage";
import { chatMessageSent } from "@/lib/analytics/events";
import {
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  CONTACT_WHATSAPP_URL,
  CONTACT_EMAIL_HREF,
} from "@/lib/contact-info";

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
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between shrink-0"
        style={{ background: "var(--gradient-primary)" }}
      >
        <div>
          <h3 className="text-white font-semibold text-sm">Ava</h3>
          <p className="text-xs text-slate-300">Your AI assistant</p>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="text-slate-300 hover:text-white transition-colors p-1"
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
            className="text-slate-300 hover:text-white transition-colors p-1"
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

      {/* Quick-action contact row */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--border)] shrink-0"
        role="group"
        aria-label="Quick contact options"
      >
        <a
          href={CONTACT_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 px-2 text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          style={{ background: "#25D366" }}
        >
          {/* WhatsApp icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>
        <a
          href={CONTACT_EMAIL_HREF}
          aria-label="Email us"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 px-2 text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue-accent)]"
          style={{ background: "var(--blue-accent)" }}
        >
          {/* Email icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 7l10 7 10-7" />
          </svg>
          Email
        </a>
        <a
          href={`tel:${CONTACT_PHONE_TEL}`}
          aria-label={`Call ${CONTACT_PHONE_DISPLAY}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 px-2 text-xs font-semibold text-[var(--text)] bg-[var(--bg)] border border-[var(--border)] transition-all hover:bg-[var(--surface)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-muted)]"
        >
          {/* Phone icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006.94 6.94l1.52-1.52a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
          Call
        </a>
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
