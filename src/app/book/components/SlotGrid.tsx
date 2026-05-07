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

/** Get YYYY-MM-DD in NY timezone for today + offset days */
function getNYDateOffset(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

/** Get the YYYY-MM-DD key for a slot in NY timezone */
function getSlotDateKey(isoUtc: string): string {
  return toNYDate(isoUtc).toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

/** Format a date key as a short day pill label, e.g. "Mon, May 12" */
function formatDayPill(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const d = new Date(year, month - 1, day, 12); // noon to avoid DST edge
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

/** Group slots by their NY calendar date key (YYYY-MM-DD) */
function groupSlotsByDateKey(slots: Slot[]): Map<string, Slot[]> {
  const map = new Map<string, Slot[]>();
  for (const slot of slots) {
    const dateKey = getSlotDateKey(slot.start);
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
  icon: string;
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
  if (morning.length > 0) groups.push({ label: "Morning", icon: "sunrise", key: "morning", slots: morning });
  if (afternoon.length > 0) groups.push({ label: "Afternoon", icon: "sun", key: "afternoon", slots: afternoon });
  if (evening.length > 0) groups.push({ label: "Evening", icon: "sunset", key: "evening", slots: evening });
  return groups;
}

/**
 * Returns true if a booking INSERT payload's scheduled_at + duration_minutes
 * overlaps the given slot's [start, end) window.
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

  return bookStart < slotEnd && bookEnd > slotStart;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Time-of-day group icon */
function TimeIcon({ type }: { type: string }) {
  if (type === "sunrise") {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-shrink-0">
        <circle cx="8" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 3v2M3.5 7.5l1.2 1.2M12.5 7.5l-1.2 1.2M1 13h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "sun") {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-shrink-0">
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.8 3.8l1 1M11.2 3.8l-1 1M3.8 12.2l1-1M11.2 12.2l-1-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  // sunset / evening
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-shrink-0">
      <path d="M1 13h14M4 10a4 4 0 0 1 8 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8 3v2M3.5 7l1 1M12.5 7l-1 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
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
  /** Currently selected day key (YYYY-MM-DD) */
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Mobile = 7-day window; desktop = 14-day
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const windowDays = isMobile ? 7 : 14;

  // Refs for realtime callback stability
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

    // Poll fallback (realtime env vars absent)
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
  const grouped = useMemo(() => groupSlotsByDateKey(slots), [slots]);

  /** Sorted list of day keys that have at least 1 available (non-taken) slot */
  const availableDays = useMemo(() => {
    const days: string[] = [];
    for (const [dateKey, daySlots] of grouped.entries()) {
      const hasAvailable = daySlots.some((s) => !takenStarts.has(s.start));
      if (hasAvailable) days.push(dateKey);
    }
    return days.sort();
  }, [grouped, takenStarts]);

  // Auto-select first available day when data loads or selectedDay becomes invalid
  useEffect(() => {
    if (availableDays.length === 0) {
      setSelectedDay(null);
      return;
    }
    if (!selectedDay || !availableDays.includes(selectedDay)) {
      setSelectedDay(availableDays[0]);
    }
  }, [availableDays, selectedDay]);

  /** Slots for the currently selected day, filtered to only available */
  const daySlots = useMemo(() => {
    if (!selectedDay) return [];
    return (grouped.get(selectedDay) ?? []).filter((s) => !takenStarts.has(s.start));
  }, [selectedDay, grouped, takenStarts]);

  /** Time-of-day groups for the selected day */
  const timeGroups = useMemo(() => groupByTimeOfDay(daySlots), [daySlots]);

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

  if (availableDays.length === 0) {
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
      {/* Consultation info */}
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

      {/* Stage 1: Day picker pills */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1"
        role="tablist"
        aria-label="Select a day"
      >
        {availableDays.map((dateKey) => {
          const isActive = dateKey === selectedDay;
          const slotCount = (grouped.get(dateKey) ?? []).filter(
            (s) => !takenStarts.has(s.start)
          ).length;

          return (
            <button
              key={dateKey}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setSelectedDay(dateKey);
                setSnipedMessage(null);
              }}
              className={`flex-shrink-0 flex flex-col items-center gap-0.5 rounded-[var(--radius)] border px-3.5 py-2.5 min-w-[80px] text-center transition-all cursor-pointer ${
                isActive
                  ? "border-[var(--blue-accent)] bg-[var(--blue-accent)] text-white shadow-[0_0_0_3px_rgba(79,86,232,0.15)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--blue-accent)] hover:text-[var(--blue-accent)]"
              }`}
            >
              <span className="text-xs font-bold leading-tight whitespace-nowrap">
                {formatDayPill(dateKey)}
              </span>
              <span
                className={`text-[10px] font-medium leading-tight ${
                  isActive ? "text-white/70" : "text-[var(--text-muted)]"
                }`}
              >
                {slotCount} slot{slotCount !== 1 ? "s" : ""}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stage 2: Time grid for selected day */}
      <AnimatePresence mode="wait">
        {selectedDay && timeGroups.length > 0 && (
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
            role="tabpanel"
            aria-label={`Available times for ${formatDayPill(selectedDay)}`}
          >
            {timeGroups.map((group) => (
              <div key={group.key}>
                {/* Time-of-day header */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[var(--text-muted)]">
                    <TimeIcon type={group.icon} />
                  </span>
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    {group.label}
                  </span>
                </div>

                {/* Slot pills grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {group.slots.map((slot) => {
                    const isSelected =
                      selectedSlot?.start === slot.start &&
                      selectedSlot?.end === slot.end;

                    return (
                      <motion.button
                        key={slot.start}
                        type="button"
                        onClick={() => onSlotSelect(slot)}
                        aria-pressed={isSelected}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className={`rounded-[var(--radius)] border px-2 py-2.5 min-h-[44px] text-sm font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "border-[var(--blue-accent)] bg-[var(--blue-accent)] text-white shadow-[0_0_0_3px_rgba(79,86,232,0.15)]"
                            : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--blue-accent)] hover:text-[var(--blue-accent)]"
                        }`}
                      >
                        {formatNYTime(slot.start)}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timezone note */}
      <p className="text-xs text-[var(--text-muted)]">
        All times shown in Eastern Time (New York).
      </p>
    </div>
  );
}
