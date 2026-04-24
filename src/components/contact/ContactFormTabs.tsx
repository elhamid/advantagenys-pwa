"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ContactForm } from "./ContactForm";
import { BookAppointmentTrigger } from "./BookAppointmentTrigger";
import { bookingTriggerOpen } from "@/lib/analytics/events";

type CardId = "booking" | "message";

// Calendar SVG icon (inline — no external icon lib dependency)
function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 3v4M15 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// Mail SVG icon (inline)
function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2 8l9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Chevron down / up icon
function ChevronIcon({ open }: { open: boolean }) {
  return (
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
  );
}

export function ContactFormTabs() {
  const shouldReduceMotion = useReducedMotion();
  const [openCard, setOpenCard] = useState<CardId | null>(null);

  // Deep-link: ?tab=booking or ?tab=message
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "booking" || tab === "message") {
      setOpenCard(tab);
    }
  }, []);

  function toggleCard(id: CardId) {
    if (id === "booking" && openCard !== "booking") {
      bookingTriggerOpen();
    }
    setOpenCard((prev) => (prev === id ? null : id));
  }

  const expandTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: "tween", ease: "easeInOut", duration: 0.25 };

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------------------------ */}
      {/* Primary card — Book an appointment                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-[var(--radius-lg)] overflow-hidden border-2 border-[var(--blue-accent)] shadow-[var(--shadow-card)]">
        {/* Card header — always visible, acts as the toggle button */}
        <button
          type="button"
          onClick={() => toggleCard("booking")}
          aria-expanded={openCard === "booking"}
          aria-controls="booking-panel"
          className="w-full flex items-center gap-4 px-5 py-5 bg-[var(--blue-accent)] text-white cursor-pointer min-h-[56px] text-left"
        >
          <span className="flex-shrink-0 opacity-90">
            <CalendarIcon />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base leading-tight">Book an appointment</span>
              {/* "Recommended" pill */}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 whitespace-nowrap">
                Recommended
              </span>
            </div>
            <p className="text-sm text-white/80 mt-0.5 leading-snug">
              Talk to Jay or Kedar — most popular.
            </p>
          </div>
          <span className="flex-shrink-0 opacity-80">
            <ChevronIcon open={openCard === "booking"} />
          </span>
        </button>

        {/* Expandable body */}
        <AnimatePresence initial={false}>
          {openCard === "booking" && (
            <motion.div
              id="booking-panel"
              key="booking-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={expandTransition}
              style={{ overflow: "hidden" }}
            >
              <div className="p-5 bg-[var(--bg)]">
                <BookAppointmentTrigger />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Secondary card — Send a message                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border)] shadow-[var(--shadow-card)]">
        {/* Card header */}
        <button
          type="button"
          onClick={() => toggleCard("message")}
          aria-expanded={openCard === "message"}
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
            <ChevronIcon open={openCard === "message"} />
          </span>
        </button>

        {/* Expandable body */}
        <AnimatePresence initial={false}>
          {openCard === "message" && (
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
