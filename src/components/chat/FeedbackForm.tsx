"use client";

/**
 * FeedbackForm — inline feedback panel rendered inside ChatPanel.
 *
 * Simple form: textarea + optional contact info section.
 * Posts to https://app.advantagenys.com/api/webhooks/pwa-feedback.
 * On success: shows thank-you state, calls onDone() after 2s.
 */

import { useState, useRef, useEffect, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const FEEDBACK_ENDPOINT =
  "https://app.advantagenys.com/api/webhooks/pwa-feedback";

interface FeedbackFormProps {
  onBack: () => void;
  onDone: () => void;
  /** Pre-fill the textarea — used when launched from the inline feedback nudge */
  initialMessage?: string;
}

export function FeedbackForm({ onBack, onDone, initialMessage }: FeedbackFormProps) {
  const reduceMotion = useReducedMotion();

  const [message, setMessage] = useState(initialMessage ?? "");
  const [contactExpanded, setContactExpanded] = useState(false);
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const payload: Record<string, string> = {
      message: message.trim(),
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
    };
    if (contactPhone.trim()) payload.contactPhone = contactPhone.trim();
    if (contactEmail.trim()) payload.contactEmail = contactEmail.trim();

    try {
      const res = await fetch(FEEDBACK_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server responded ${res.status}`);
      }

      setSubmitted(true);
      setTimeout(() => {
        onDone();
      }, 2000);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong — please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <motion.div
        key="feedback-success"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex flex-col items-center justify-center flex-1 px-6 py-10 text-center gap-3"
        role="status"
        aria-live="polite"
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
          style={{ background: "rgba(34, 197, 94, 0.15)" }}
          aria-hidden="true"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgb(34,197,94)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-[var(--text)]">
          Thanks! We got your feedback.
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          Returning to chat&hellip;
        </p>
      </motion.div>
    );
  }

  const charMax = 2000;
  const charRemaining = charMax - message.length;

  return (
    <motion.div
      key="feedback-form"
      initial={reduceMotion ? false : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="flex flex-col flex-1 min-h-0 overflow-y-auto"
    >
      {/* Back nav */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 shrink-0">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to chat"
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors min-h-[44px] -ml-1 px-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-accent)]"
        >
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
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to chat
        </button>
        <span className="ml-auto text-xs font-semibold text-[var(--text)]">
          Leave feedback
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 px-4 pb-4"
        noValidate
      >
        {/* Message textarea */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="feedback-message"
            className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]"
          >
            Message <span aria-hidden="true">*</span>
          </label>
          <textarea
            ref={textareaRef}
            id="feedback-message"
            name="message"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, charMax))}
            placeholder="What's on your mind?"
            rows={4}
            aria-describedby="feedback-char-count"
            className="w-full resize-none px-3 py-2.5 text-sm rounded-xl bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] outline-none focus:border-[var(--blue-accent)] focus:ring-1 focus:ring-[var(--blue-accent)] transition-colors placeholder:text-[var(--text-muted)]"
          />
          <p
            id="feedback-char-count"
            className="text-right text-[10px] text-[var(--text-muted)]"
            aria-live="polite"
            aria-atomic="true"
          >
            {charRemaining} remaining
          </p>
        </div>

        {/* Collapsible contact info */}
        <div className="rounded-xl border border-[var(--border)] overflow-hidden">
          <button
            type="button"
            onClick={() => setContactExpanded((prev) => !prev)}
            aria-expanded={contactExpanded}
            aria-controls="feedback-contact-section"
            className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--blue-accent)]"
          >
            <span>Add contact info (optional)</span>
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
              className="shrink-0 transition-transform duration-200"
              style={{
                transform: contactExpanded
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
              }}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          <AnimatePresence initial={false}>
            {contactExpanded && (
              <motion.div
                id="feedback-contact-section"
                key="contact-section"
                initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { height: 0, opacity: 0 }
                }
                transition={{ duration: 0.18, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-3 px-3 pb-3 pt-1">
                  <div>
                    <label
                      htmlFor="feedback-phone"
                      className="block text-[11px] font-medium text-[var(--text-muted)] mb-1"
                    >
                      Phone
                    </label>
                    <input
                      id="feedback-phone"
                      type="tel"
                      autoComplete="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="(929) 000-0000"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] outline-none focus:border-[var(--blue-accent)] focus:ring-1 focus:ring-[var(--blue-accent)] transition-colors placeholder:text-[var(--text-muted)]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="feedback-email"
                      className="block text-[11px] font-medium text-[var(--text-muted)] mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="feedback-email"
                      type="email"
                      autoComplete="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] outline-none focus:border-[var(--blue-accent)] focus:ring-1 focus:ring-[var(--blue-accent)] transition-colors placeholder:text-[var(--text-muted)]"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              key="feedback-error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
              role="alert"
            >
              <p className="text-xs text-red-600 dark:text-red-400">
                {submitError}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <button
          type="submit"
          disabled={!message.trim() || isSubmitting}
          className="w-full min-h-[44px] rounded-full text-sm font-semibold text-white transition-all disabled:opacity-40 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-accent)] focus-visible:ring-offset-2"
          style={{ background: "var(--blue-accent)" }}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Sending…" : "Send feedback"}
        </button>
      </form>
    </motion.div>
  );
}
