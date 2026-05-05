"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Turnstile } from "@marsidev/react-turnstile";
import { ServicePicker, SERVICES } from "./components/ServicePicker";
import { SlotGrid } from "./components/SlotGrid";
import { BookingContactForm } from "./components/BookingContactForm";
import {
  BOOK_LIVE,
  confirmBooking,
  SlotConflictError,
  type Slot,
  type AlternativeSlot,
} from "@/lib/booking-client";

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

const STEPS = [
  { id: 1, label: "Service" },
  { id: 2, label: "Time" },
  { id: 3, label: "Details" },
] as const;

function StepIndicator({ current }: { current: number }) {
  // In inert mode: only 2 effective steps (1=service, 2=details → displayed as 1→2)
  const totalSteps = BOOK_LIVE ? 3 : 2;
  // Remap current step for display in inert mode
  const displayCurrent = BOOK_LIVE ? current : current === 3 ? 2 : current;

  return (
    <nav aria-label="Booking steps" className="flex items-center gap-0 mb-6 md:mb-8">
      {(BOOK_LIVE ? STEPS : STEPS.filter((s) => s.id !== 2)).map((step, idx) => {
        const displayId = idx + 1;
        const isActive = displayCurrent === displayId;
        const isDone = displayCurrent > displayId;

        return (
          <div key={step.id} className="flex items-center flex-1">
            {/* Connector line before */}
            {idx > 0 && (
              <div
                className={`h-px flex-1 transition-colors ${
                  isDone || isActive ? "bg-[var(--blue-accent)]" : "bg-[var(--border)]"
                }`}
              />
            )}

            {/* Step dot + label */}
            <div className="flex flex-col items-center gap-1 md:gap-1.5">
              <span
                className={`flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full text-[10px] md:text-xs font-bold transition-all ${
                  isDone
                    ? "bg-[var(--blue-accent)] text-white"
                    : isActive
                    ? "bg-[var(--blue-accent)] text-white shadow-[0_0_0_3px_rgba(79,86,232,0.15)] md:shadow-[0_0_0_4px_rgba(79,86,232,0.15)]"
                    : "bg-[var(--bg-section)] text-[var(--text-muted)] border border-[var(--border)]"
                }`}
              >
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="md:w-3.5 md:h-3.5">
                    <path d="M2.5 7l3 3L11.5 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  displayId
                )}
              </span>
              <span
                className={`text-[10px] md:text-xs font-medium ${
                  isActive ? "text-[var(--blue-accent)]" : "text-[var(--text-muted)]"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line after last step */}
            {idx < totalSteps - 1 && (
              <div
                className={`h-px flex-1 transition-colors ${
                  isDone ? "bg-[var(--blue-accent)]" : "bg-[var(--border)]"
                }`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Toast notification
// ---------------------------------------------------------------------------

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full mx-4"
    >
      <div className="flex items-start gap-3 rounded-[var(--radius)] bg-amber-50 border border-amber-200 px-4 py-3 shadow-[var(--shadow-lg)]">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="flex-shrink-0 mt-0.5" aria-hidden="true">
          <circle cx="9" cy="9" r="7.5" stroke="#D97706" strokeWidth="1.5" />
          <path d="M9 5.5v4M9 12.5h.01" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <p className="flex-1 text-sm text-amber-800">{message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="text-amber-600 hover:text-amber-800 cursor-pointer"
          aria-label="Dismiss"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main BookingFlow
// ---------------------------------------------------------------------------

export function BookingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [assigneeInitials, setAssigneeInitials] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  /** Inline 409 alternatives returned by taskboard (Wave 2 onwards). */
  const [conflictAlternatives, setConflictAlternatives] = useState<AlternativeSlot[]>([]);

  const serviceObj = SERVICES.find((s) => s.slug === selectedService);

  // ---- navigation helpers ----

  function handleServiceSelect(slug: string) {
    setSelectedService(slug);
  }

  function handleServiceContinue() {
    if (!selectedService) return;
    if (BOOK_LIVE) {
      setStep(2);
    } else {
      // Inert: skip slot grid, go straight to contact form
      setStep(3);
    }
  }

  function handleSlotSelect(slot: Slot) {
    setSelectedSlot(slot);
  }

  function handleSlotContinue() {
    if (!selectedSlot) return;
    setConflictAlternatives([]);
    setStep(3);
  }

  function handleBack() {
    if (step === 2) {
      setStep(1);
      setConflictAlternatives([]);
    }
    if (step === 3) setStep(BOOK_LIVE ? 2 : 1);
    setSubmitError(null);
  }

  // ---- form submit ----

  const handleFormSubmit = useCallback(
    async (data: {
      name: string;
      email: string;
      phone: string;
      notes: string;
    }) => {
      setSubmitLoading(true);
      setSubmitError(null);

      try {
        if (BOOK_LIVE && selectedSlot && selectedService) {
          // --- Live mode: call taskboard API ---
          const result = await confirmBooking({
            service: selectedService,
            slot_start: selectedSlot.start,
            slot_end: selectedSlot.end,
            name: data.name,
            email: data.email,
            phone: data.phone || undefined,
            notes: data.notes || undefined,
          });

          router.push(
            `/book/confirmed?id=${encodeURIComponent(result.confirmation_id)}&service=${encodeURIComponent(selectedService)}`
          );
        } else {
          // --- Inert mode: POST to existing /api/contact (Phase 0 lead capture) ---
          const payload = {
            type: "booking",
            source: "advantagenys.com_book_page",
            fullName: data.name,
            email: data.email,
            phone: data.phone || undefined,
            serviceType: serviceObj?.label ?? selectedService ?? undefined,
            description: data.notes || undefined,
            wantsAppointment: true,
            turnstileToken: turnstileToken || undefined,
          };

          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const json = (await res.json()) as { success?: boolean; error?: string };
          if (!res.ok || !json.success) {
            throw new Error(json.error ?? "Something went wrong. Please try again.");
          }

          const serviceSlug = selectedService ?? "consulting";
          router.push(`/book/confirmed?mode=inert&service=${encodeURIComponent(serviceSlug)}`);
        }
      } catch (err) {
        if (err instanceof SlotConflictError) {
          // Return to slot grid, surface alternatives or refresh
          setStep(2);
          setSelectedSlot(null);
          if (err.alternatives.length > 0) {
            // Wave 2: show inline alternatives without a full refresh
            setConflictAlternatives(err.alternatives);
          } else {
            // Pre-Wave 2 or empty alternatives: show toast + refresh grid
            setToast(err.message);
            setConflictAlternatives([]);
            window.dispatchEvent(new Event("booking:refresh-slots"));
          }
        } else {
          setSubmitError(
            err instanceof Error ? err.message : "Something went wrong. Please try again."
          );
        }
      } finally {
        setSubmitLoading(false);
      }
    },
    [router, selectedService, selectedSlot, serviceObj]
  );

  // ---- render ----

  const containerVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast message={toast} onDismiss={() => setToast(null)} />
        )}
      </AnimatePresence>

      {/* Step indicator */}
      <StepIndicator current={step} />

      {/* Step content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step-1"
            variants={containerVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <div className="mb-2">
              <h2 className="text-xl font-bold text-[var(--text)]">
                What can we help you with?
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                20-minute consult, free. No obligation.
              </p>
            </div>

            <div className="mt-5">
              <ServicePicker
                selected={selectedService}
                onSelect={handleServiceSelect}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleServiceContinue}
                disabled={!selectedService}
                className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--blue-accent)] px-6 py-3 text-sm font-bold text-white shadow-[var(--shadow-md)] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Continue
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && BOOK_LIVE && (
          <motion.div
            key="step-2"
            variants={containerVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors cursor-pointer"
                aria-label="Back to service selection"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back
              </button>
              {serviceObj && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--blue-pale)] text-[var(--blue-accent)]">
                  {serviceObj.label}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-[var(--text)] mb-1">
              Pick a time
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-5">
              Choose a 20-minute slot that works for you.
            </p>

            {/* 409 Alternatives banner — shown when taskboard Wave 2 returns alternatives */}
            <AnimatePresence>
              {conflictAlternatives.length > 0 && (
                <motion.div
                  key="conflict-alternatives"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-[var(--radius)] bg-amber-50 border border-amber-200 px-4 py-3 mb-4"
                >
                  <p className="text-sm font-semibold text-amber-900 mb-2">
                    Someone else just grabbed that — try one of these instead:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {conflictAlternatives.map((alt) => (
                      <button
                        key={alt.start}
                        type="button"
                        onClick={() => {
                          handleSlotSelect({
                            start: alt.start,
                            end: alt.end,
                            assignee_user_id: alt.assignee_user_id ?? "",
                          });
                          setConflictAlternatives([]);
                        }}
                        className="rounded-[var(--radius)] border border-amber-300 bg-white px-3.5 py-2 text-sm font-medium text-amber-900 hover:border-amber-500 hover:bg-amber-50 transition-all cursor-pointer"
                      >
                        {new Intl.DateTimeFormat("en-US", {
                          timeZone: "America/New_York",
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        }).format(new Date(alt.start))}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <SlotGrid
              service={selectedService!}
              onSlotSelect={(slot) => {
                handleSlotSelect(slot);
                // Clear alternatives when user picks from the full grid
                setConflictAlternatives([]);
              }}
              selectedSlot={selectedSlot}
              assigneeInitials={assigneeInitials}
              onAssigneeInitialsChange={setAssigneeInitials}
              onSelectedSlotTaken={() => {
                // Realtime: selected slot was sniped — clear it so Continue stays disabled
                setSelectedSlot(null);
                setConflictAlternatives([]);
              }}
            />

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-section)] transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSlotContinue}
                disabled={!selectedSlot}
                className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--blue-accent)] px-6 py-3 text-sm font-bold text-white shadow-[var(--shadow-md)] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Continue
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step-3"
            variants={containerVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors cursor-pointer"
                aria-label="Go back"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back
              </button>

              {/* Summary badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {serviceObj && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--blue-pale)] text-[var(--blue-accent)]">
                    {serviceObj.label}
                  </span>
                )}
                {selectedSlot && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--teal-bg)] text-[var(--teal)]">
                    {new Intl.DateTimeFormat("en-US", {
                      timeZone: "America/New_York",
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    }).format(new Date(selectedSlot.start))}
                  </span>
                )}
              </div>
            </div>

            <h2 className="text-xl font-bold text-[var(--text)] mb-1">
              Your details
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-5">
              {BOOK_LIVE
                ? "Almost done — fill in your info to confirm the appointment."
                : "Tell us how to reach you and we will schedule your consult."}
            </p>

            {!BOOK_LIVE && (
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onSuccess={setTurnstileToken}
                options={{ size: "invisible" }}
              />
            )}

            <BookingContactForm
              onSubmit={handleFormSubmit}
              loading={submitLoading}
              error={submitError}
              isInertMode={!BOOK_LIVE}
              serviceLabel={serviceObj?.label}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
