"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { ContactForm } from "./ContactForm";

// Mail SVG icon (inline)
function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2 8l9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Contact page form — send a message / general inquiry.
 *
 * The booking tab was removed: /book is now the canonical booking surface.
 * All "Book Appointment" CTAs across the site link to /book directly.
 *
 * This component renders the single "Send a message" card so the /contact
 * page remains useful for general inquiries, questions, and non-booking
 * contact requests.
 */
export function ContactFormTabs() {
  const shouldReduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);

  const expandTransition = shouldReduceMotion
    ? { duration: 0 }
    : ({ type: "tween", ease: "easeInOut", duration: 0.25 } as const);

  return (
    <div>
      {/* Book appointment CTA — links to /book */}
      <div className="mb-4 rounded-[var(--radius-lg)] border-2 border-[var(--blue-accent)] bg-[var(--blue-pale)] p-5">
        <h2 className="text-base font-bold text-[var(--text)] mb-1">
          Book an Appointment
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Pick a time that works for you — 20-minute free consult with a specialist.
        </p>
        <a
          href="/book"
          className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--blue-accent)] px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-md)] hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Schedule Now
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

      {/* Send a message card */}
      <div className="rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border)] shadow-[var(--shadow-card)]">
        {/* Card header */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="message-panel"
          className="w-full flex items-center gap-4 px-5 py-5 bg-[var(--surface)] text-[var(--text)] cursor-pointer min-h-[56px] text-left hover:bg-[var(--surface-hover,var(--surface))] transition-colors"
        >
          <span className="flex-shrink-0 text-[var(--text-secondary)]">
            <MailIcon />
          </span>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-base leading-tight">Send a message</span>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5 leading-snug">
              Have a quick question? We&apos;ll reply by email.
            </p>
          </div>
          <span className="flex-shrink-0 text-[var(--text-secondary)]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
              style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
            >
              <path d="M4 6l5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>

        {/* Expandable body */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id="message-panel"
              key="message-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={expandTransition}
              style={{ overflow: "hidden" }}
            >
              <div className="p-5 bg-[var(--bg)]">
                <ContactForm />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
