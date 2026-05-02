"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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

/** Get the hour in NY timezone (0-23) for time-of-day grouping */
function getNYHour(isoUtc: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    hour12: false,
  }).formatToParts(toNYDate(isoUtc));
  const hourPart = parts.find((p) => p.type === "hour");
  return parseInt(hourPart?.value ?? "0", 10);
}

type TimeOfDay = "morning" | "afternoon" | "evening";

interface TimeGroup {
  label: string;
  key: TimeOfDay;
  slots: Slot[];
}

/** Split a day's slots into Morning / Afternoon / Evening */
function groupByTimeOfDay(daySlots: Slot[]): TimeGroup[] {
  const morning: Slot[] = [];
  const afternoon: Slot[] = [];
  const evening: Slot[] = [];

  for (const slot of daySlots) {
    const hour = getNYHour(slot.start);
    if (hour < 12) {
      morning.push(slot);
    } else if (hour < 17) {
      afternoon.push(slot);
    } else {
      evening.push(slot);
    }
  }

  const groups: TimeGroup[] = [];
  if (morning.length > 0) groups.push({ label: "Morning", key: "morning", slots: morning });
  if (afternoon.length > 0) groups.push({ label: "Afternoon", key: "afternoon", slots: afternoon });
  if (evening.length > 0) groups.push({ label: "Evening", key: "evening", slots: evening });
  return groups;
}

/**
 * Returns true if a booking INSERT payload's scheduled_at + duration_minutes
 * overlaps the given slot's [start, end) window.
 *
 * payload.new.scheduled_at — ISO UTC string
 * payload.new.duration_minutes — number (default 20 if absent)
 */
function payloadOverlapsSlot(
  payload: { scheduled_at?: string; duration_minutes?: number },
  slot: Slot
): boolean {
  if (!payload.scheduled_at) return false;
  const bookStart = new Date(payload.scheduled_at).getTime();
  const duration = payload.duration_minutes ?? 20;
  const bookEnd = bookStart + duration * 60_000;

  const slotStart = new Date(slot.start).getTime();
  const slotEnd = new Date(slot.end).getTime();

  // Overlap: bookStart < slotEnd && bookEnd > slotStart
  return bookStart < slotEnd && bookEnd > slotStart;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
  /** Set of day labels that are expanded in the accordion */
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  /** Whether "Show more days" has been activated */
  const [showAllDays, setShowAllDays] = useState(false);

  // Mobile = 7-day window; desktop = 14-day
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const windowDays = isMobile ? 7 : 14;
  /** How many days to show expanded by default */
  const defaultExpandedCount = isMobile ? 1 : 3;

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

  // ---- derived data ----

  const slots = slotsData?.slots ?? [];
  const grouped = groupSlotsByDate(slots);
  const dayEntries = useMemo(() => Array.from(grouped.entries()), [grouped]);

  // Initialize expanded days when data loads
  useEffect(() => {
    if (dayEntries.length === 0) return;
    const initial = new Set<string>();
    // Find the first N days that have at least one available slot
    let expandedCount = 0;
    for (const [dateLabel, daySlots] of dayEntries) {
      const hasAvailable = daySlots.some((s) => !takenStarts.has(s.start));
      if (hasAvailable && expandedCount < defaultExpandedCount) {
        initial.add(dateLabel);
        expandedCount++;
      }
    }
    // If we didn't fill the quota (all days fully booked), expand first N anyway
    if (expandedCount === 0) {
      for (let i = 0; i < Math.min(defaultExpandedCount, dayEntries.length); i++) {
        initial.add(dayEntries[i][0]);
      }
    }
    setExpandedDays(initial);
    setShowAllDays(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotsData]);

  // Split days into initially visible vs overflow
  const visibleDayCount = isMobile ? 3 : 5;
  const visibleDays = showAllDays ? dayEntries : dayEntries.slice(0, visibleDayCount);
  const hasMoreDays = dayEntries.length > visibleDayCount && !showAllDays;

  function toggleDay(dateLabel: string) {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dateLabel)) {
        next.delete(dateLabel);
      } else {
        next.add(dateLabel);
      }
      return next;
    });
  }

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
    <div className="space-y-4">
      {/* Consultation info — replaces assignee badge */}
      <p className="text-sm text-[var(--text-secondary)]">
        20-minute free consultation — someone from our team will be with you.
      </p>

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

      {/* Day accordion + slot grid */}
      <div className="max-h-[60vh] overflow-y-auto md:max-h-none md:overflow-visible space-y-3">
        {visibleDays.map(([dateLabel, daySlots]) => {
          const allTaken = daySlots.every((s) => takenStarts.has(s.start));
          const isExpanded = expandedDays.has(dateLabel);
          const availableCount = daySlots.filter((s) => !takenStarts.has(s.start)).length;
          const timeGroups = groupByTimeOfDay(daySlots);

          return (
            <div
              key={dateLabel}
              className="rounded-[var(--radius)] border border-[var(--border)] overflow-hidden"
            >
              {/* Sticky day header */}
              <button
                type="button"
                onClick={() => toggleDay(dateLabel)}
                className="sticky top-0 z-10 flex w-full items-center justify-between gap-2 bg-[var(--bg-section)] px-3 py-2.5 md:px-4 md:py-3 cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide truncate">
                    {dateLabel}
                  </span>
                  {allTaken ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--bg-section)] text-[var(--text-muted)] border border-[var(--border)]">
                      Fully booked
                    </span>
                  ) : (
                    <span className="text-[10px] text-[var(--text-muted)] font-medium">
                      {availableCount} slot{availableCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <ChevronIcon expanded={isExpanded} />
              </button>

              {/* Expandable slot content */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    {allTaken ? (
                      <div className="px-3 py-4 md:px-4 text-center">
                        <p className="text-xs text-[var(--text-muted)]">
                          All slots for this day have been taken.
                        </p>
                      </div>
                    ) : (
                      <div className="px-3 py-3 md:px-4 space-y-3">
                        {timeGroups.map((group) => {
                          // Check if all slots in this group are taken
                          const groupAllTaken = group.slots.every((s) => takenStarts.has(s.start));
                          if (groupAllTaken) return null;

                          return (
                            <div key={group.key}>
                              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                                {group.label}
                              </p>
                              <div className="flex flex-wrap gap-2.5">
                                <AnimatePresence>
                                  {group.slots.map((slot) => {
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
                                        className={`rounded-[var(--radius)] border px-4 py-3 min-h-[44px] text-sm font-medium transition-all ${
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
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Show more days trigger */}
        {hasMoreDays && (
          <button
            type="button"
            onClick={() => setShowAllDays(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--bg-section)] px-4 py-3 text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--blue-accent)] hover:text-[var(--blue-accent)] transition-colors cursor-pointer"
          >
            Show {dayEntries.length - visibleDayCount} more day{dayEntries.length - visibleDayCount !== 1 ? "s" : ""}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 5.5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Timezone note */}
      <p className="text-xs text-[var(--text-muted)]">
        All times shown in Eastern Time (New York).
      </p>
    </div>
  );
}
