"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchSlots, type Slot, type SlotsResponse } from "@/lib/booking-client";
import { bookingSupabase } from "@/lib/booking-realtime";

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function toNYDate(isoUtc: string): Date {
  return new Date(isoUtc);
}

/** Format ISO UTC time as readable NY time, e.g. "10:00 AM" */
function formatNYTime(isoUtc: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(toNYDate(isoUtc));
}

/** Format NY calendar date, e.g. "Mon Apr 28" */
function _formatNYDate(isoUtc: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(toNYDate(isoUtc));
}

/** Get YYYY-MM-DD in NY timezone for today + offset days */
function getNYDateOffset(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString("en-CA", { timeZone: "America/New_York" }); // en-CA gives YYYY-MM-DD
}

/** Group slots by their NY calendar date string */
function groupSlotsByDate(slots: Slot[]): Map<string, Slot[]> {
  const map = new Map<string, Slot[]>();
  for (const slot of slots) {
    const dateKey = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(toNYDate(slot.start));
    if (!map.has(dateKey)) map.set(dateKey, []);
    map.get(dateKey)!.push(slot);
  }
  return map;
}

/**
 * Returns true if a booking INSERT payload's scheduled_at + duration_minutes
 * overlaps the given slot's [start, end) window.
 *
 * payload.new.scheduled_at — ISO UTC string
 * payload.new.duration_minutes — number (default 30 if absent)
 */
function payloadOverlapsSlot(
  payload: { scheduled_at?: string; duration_minutes?: number },
  slot: Slot
): boolean {
  if (!payload.scheduled_at) return false;
  const bookStart = new Date(payload.scheduled_at).getTime();
  const duration = payload.duration_minutes ?? 30;
  const bookEnd = bookStart + duration * 60_000;

  const slotStart = new Date(slot.start).getTime();
  const slotEnd = new Date(slot.end).getTime();

  // Overlap: bookStart < slotEnd && bookEnd > slotStart
  return bookStart < slotEnd && bookEnd > slotStart;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SlotGridProps {
  service: string;
  onSlotSelect: (slot: Slot) => void;
  selectedSlot: Slot | null;
  assigneeInitials: string;
  onAssigneeInitialsChange: (initials: string) => void;
  /** Called when the currently-selected slot is taken by someone else. */
  onSelectedSlotTaken?: () => void;
}

export function SlotGrid({
  service,
  onSlotSelect,
  selectedSlot,
  assigneeInitials,
  onAssigneeInitialsChange,
  onSelectedSlotTaken,
}: SlotGridProps) {
  const [slotsData, setSlotsData] = useState<SlotsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Set of slot start ISO strings that have been taken since grid loaded. */
  const [takenStarts, setTakenStarts] = useState<Set<string>>(new Set());
  /** Inline message when the user's selected slot was just sniped. */
  const [snipedMessage, setSnipedMessage] = useState<string | null>(null);

  // Mobile = 7-day window; desktop = 14-day
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const windowDays = isMobile ? 7 : 14;

  // Keep a stable ref to selectedSlot so realtime callback can read it without
  // re-subscribing every time the selection changes.
  const selectedSlotRef = useRef(selectedSlot);
  useEffect(() => {
    selectedSlotRef.current = selectedSlot;
  }, [selectedSlot]);

  const onSelectedSlotTakenRef = useRef(onSelectedSlotTaken);
  useEffect(() => {
    onSelectedSlotTakenRef.current = onSelectedSlotTaken;
  }, [onSelectedSlotTaken]);

  // ---- slot fetching ----

  const loadSlots = useCallback(async () => {
    if (!service) return;
    setLoading(true);
    setError(null);
    try {
      const from = getNYDateOffset(0);
      const to = getNYDateOffset(windowDays - 1);
      const data = await fetchSlots({ service, from, to });
      setSlotsData(data);
      // Reset taken set on a fresh load
      setTakenStarts(new Set());
      setSnipedMessage(null);
      onAssigneeInitialsChange(data.assignee_initials);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load available times. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [service, windowDays, onAssigneeInitialsChange]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  // Expose a refresh handle via a custom event (used by BookingFlow on 409)
  useEffect(() => {
    function handleRefresh() {
      void loadSlots();
    }
    window.addEventListener("booking:refresh-slots", handleRefresh);
    return () => window.removeEventListener("booking:refresh-slots", handleRefresh);
  }, [loadSlots]);

  // ---- realtime subscription or poll fallback ----

  useEffect(() => {
    if (!service || !slotsData) return;

    // --- Realtime path ---
    if (bookingSupabase) {
      const channel = bookingSupabase
        .channel("public:bookings:grid")
        .on(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          "postgres_changes" as any,
          {
            event: "INSERT",
            schema: "public",
            table: "bookings",
            filter: "status=eq.scheduled",
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (payload: any) => {
            const newBooking = payload.new as {
              scheduled_at?: string;
              duration_minutes?: number;
            };

            // Mark any slots in the current grid that overlap this booking
            const slots = slotsData.slots;
            const newlyTaken: string[] = [];
            for (const slot of slots) {
              if (payloadOverlapsSlot(newBooking, slot)) {
                newlyTaken.push(slot.start);
              }
            }

            if (newlyTaken.length === 0) return;

            setTakenStarts((prev) => {
              const next = new Set(prev);
              newlyTaken.forEach((s) => next.add(s));
              return next;
            });

            // If the user had one of those slots selected, notify parent
            const current = selectedSlotRef.current;
            if (current && newlyTaken.includes(current.start)) {
              setSnipedMessage(
                "That slot was just taken — please pick a different time."
              );
              onSelectedSlotTakenRef.current?.();
            }
          }
        )
        .subscribe();

      return () => {
        void channel.unsubscribe();
      };
    }

    // --- Poll fallback (realtime env vars absent) ---
    // Re-fetch slots every 15s while the page is visible.
    const POLL_MS = 15_000;
    let timer: ReturnType<typeof setTimeout> | null = null;

    function scheduleNextPoll() {
      timer = setTimeout(() => {
        if (document.visibilityState !== "hidden") {
          void loadSlots();
        }
        scheduleNextPoll();
      }, POLL_MS);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && timer === null) {
        scheduleNextPoll();
      }
    }

    scheduleNextPoll();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timer !== null) clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [service, slotsData, loadSlots]);

  // ---- render ----

  if (loading && !slotsData) {
    return (
      <div className="py-12 text-center">
        <div className="inline-flex gap-1.5 items-center text-[var(--text-secondary)] text-sm">
          <span className="h-4 w-4 rounded-full border-2 border-[var(--blue-accent)] border-t-transparent animate-spin" />
          Loading available times...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center space-y-3">
        <p className="text-sm text-red-500">{error}</p>
        <button
          type="button"
          onClick={() => void loadSlots()}
          className="text-sm text-[var(--blue-accent)] font-medium underline-offset-2 hover:underline cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  const slots = slotsData?.slots ?? [];
  const grouped = groupSlotsByDate(slots);

  if (grouped.size === 0) {
    return (
      <div className="py-8 text-center space-y-2">
        <p className="text-sm text-[var(--text-secondary)]">
          No times available in the next {windowDays} days.
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          Call us at{" "}
          <a href="tel:+19299331396" className="text-[var(--blue-accent)] font-medium">
            (929) 933-1396
          </a>{" "}
          to schedule directly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Assignee badge */}
      {assigneeInitials && (
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--blue-accent)] text-white text-xs font-bold">
            {assigneeInitials}
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            with {assigneeInitials} — 30 min free consult
          </span>
        </div>
      )}

      {/* Sniped slot message */}
      <AnimatePresence>
        {snipedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2 rounded-[var(--radius)] bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm text-amber-800"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5" aria-hidden="true">
              <circle cx="8" cy="8" r="6.5" stroke="#D97706" strokeWidth="1.4" />
              <path d="M8 5v3.5M8 10.5h.01" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span>{snipedMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Date groups */}
      <div className="space-y-4">
        {Array.from(grouped.entries()).map(([dateLabel, daySlots]) => (
          <div key={dateLabel}>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
              {dateLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {daySlots.map((slot) => {
                  const isSelected =
                    selectedSlot?.start === slot.start &&
                    selectedSlot?.end === slot.end;
                  const isTaken = takenStarts.has(slot.start);

                  return (
                    <motion.button
                      key={slot.start}
                      type="button"
                      onClick={() => {
                        if (isTaken) return;
                        onSlotSelect(slot);
                      }}
                      aria-pressed={isSelected}
                      aria-disabled={isTaken}
                      disabled={isTaken}
                      // Entry animation
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{
                        opacity: isTaken ? 0.3 : 1,
                        scale: 1,
                      }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.25 }}
                      className={`rounded-[var(--radius)] border px-3.5 py-2 text-sm font-medium transition-all ${
                        isTaken
                          ? "border-[var(--border)] bg-[var(--bg-section)] text-[var(--text-muted)] cursor-not-allowed line-through"
                          : isSelected
                          ? "border-[var(--blue-accent)] bg-[var(--blue-accent)] text-white shadow-[0_0_0_3px_rgba(79,86,232,0.15)] cursor-pointer"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--blue-accent)] hover:text-[var(--blue-accent)] cursor-pointer"
                      }`}
                    >
                      {formatNYTime(slot.start)}
                      {isTaken && (
                        <span className="sr-only"> (taken)</span>
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* Timezone note */}
      <p className="text-xs text-[var(--text-muted)]">
        All times shown in Eastern Time (New York).
      </p>
    </div>
  );
}
