"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { BookingForm } from "./BookingForm";
import { BOOKING_MODE, AOS_ORIGIN, buildBookingUrl } from "@/lib/aos-booking";
import { bookingRedirectClick, bookingIframeOpen, bookingIframeConfirmed } from "@/lib/analytics/events";
import { Card } from "@/components/ui/Card";

/**
 * Top-level component for the "Book Appointment" action.
 *
 * Reads BOOKING_MODE from aos-booking.ts:
 *   "form"     — renders inline BookingForm (Phase 0, default)
 *   "redirect" — CTA button → window.location redirect to AOS booking page
 *   "iframe"   — CTA button → modal with AOS iframe; postMessage closes on success
 */
export function BookAppointmentTrigger({ selectedService }: { selectedService?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const [iframeOpen, setIframeOpen] = useState(false);
  const [iframeConfirmed, setIframeConfirmed] = useState<{ bookingId: string } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // ---- postMessage listener for iframe mode ----
  useEffect(() => {
    if (BOOKING_MODE !== "iframe") return;

    function handleMessage(event: MessageEvent) {
      if (event.origin !== AOS_ORIGIN) return;
      if (event.data?.type === "aos.booking.confirmed") {
        const bookingId = String(event.data.booking_id ?? "");
        bookingIframeConfirmed(bookingId);
        setIframeOpen(false);
        setIframeConfirmed({ bookingId });
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // ---- iframe confirmed state ----
  if (iframeConfirmed) {
    return (
      <Card className="text-center py-10">
        <div className="text-4xl mb-4 text-[var(--green)]">&#10003;</div>
        <h3 className="text-xl font-bold text-[var(--text)] mb-2">You&apos;re booked.</h3>
        <p className="text-[var(--text-secondary)]">
          Confirmation sent to your email.
        </p>
        {iframeConfirmed.bookingId && (
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Booking ID: {iframeConfirmed.bookingId}
          </p>
        )}
      </Card>
    );
  }

  // ---- form mode (Phase 0) ----
  if (BOOKING_MODE === "form") {
    return <BookingForm />;
  }

  // ---- redirect mode ----
  if (BOOKING_MODE === "redirect") {
    return (
      <div className="text-center py-6">
        <p className="text-[var(--text-secondary)] mb-4 text-sm">
          You&apos;ll be taken to our scheduling page to pick a time.
        </p>
        <button
          type="button"
          onClick={() => {
            bookingRedirectClick(selectedService ?? "Consulting");
            window.location.href = buildBookingUrl({ service: selectedService ?? "Consulting" });
          }}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[var(--radius-lg)] bg-[var(--blue-accent)] text-white font-semibold text-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          Schedule Now
        </button>
      </div>
    );
  }

  // ---- iframe mode ----
  const iframeUrl = buildBookingUrl({ service: selectedService ?? "Consulting", embed: true });

  return (
    <>
      <div className="text-center py-6">
        <p className="text-[var(--text-secondary)] mb-4 text-sm">
          Pick a time that works for you — powered by AOS Scheduler.
        </p>
        <button
          type="button"
          onClick={() => {
            bookingIframeOpen(selectedService ?? "Consulting");
            setIframeOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[var(--radius-lg)] bg-[var(--blue-accent)] text-white font-semibold text-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          Schedule Now
        </button>
      </div>

      {/* Modal overlay */}
      <AnimatePresence>
        {iframeOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
              onClick={() => setIframeOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
              aria-hidden="true"
            />

            {/* Modal panel */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
              transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-x-4 bottom-0 md:inset-auto md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 bg-[var(--surface)] rounded-[var(--radius-lg)] shadow-2xl overflow-hidden flex flex-col"
              style={{ maxWidth: "720px", width: "100%", maxHeight: "90vh" }}
              role="dialog"
              aria-modal="true"
              aria-label="Book appointment"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <span className="font-semibold text-[var(--text)]">Book an Appointment</span>
                <button
                  onClick={() => setIframeOpen(false)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* iframe */}
              <iframe
                ref={iframeRef}
                src={iframeUrl}
                title="Book appointment"
                className="flex-1 w-full border-0"
                style={{ minHeight: "480px" }}
                allow="payment"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
