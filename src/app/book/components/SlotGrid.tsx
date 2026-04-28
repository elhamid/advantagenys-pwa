"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchSlots, type Slot, type SlotsResponse } from "@/lib/booking-client";

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function toNYDate(isoUtc: string): Date {
  // Parse ISO UTC then render in NY timezone
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
function formatNYDate(isoUtc: string): string {
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SlotGridProps {
  service: string;
  onSlotSelect: (slot: Slot) => void;
  selectedSlot: Slot | null;
  assigneeInitials: string;
  onAssigneeInitialsChange: (initials: string) => void;
}

export function SlotGrid({
  service,
  onSlotSelect,
  selectedSlot,
  assigneeInitials,
  onAssigneeInitialsChange,
}: SlotGridProps) {
  const [slotsData, setSlotsData] = useState<SlotsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mobile = 7-day window; desktop = 14-day
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const windowDays = isMobile ? 7 : 14;

  const loadSlots = useCallback(async () => {
    if (!service) return;
    setLoading(true);
    setError(null);
    try {
      const from = getNYDateOffset(0);
      const to = getNYDateOffset(windowDays - 1);
      const data = await fetchSlots({ service, from, to });
      setSlotsData(data);
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

  if (loading) {
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
                    selectedSlot?.start === slot.start && selectedSlot?.end === slot.end;
                  return (
                    <motion.button
                      key={slot.start}
                      type="button"
                      onClick={() => onSlotSelect(slot)}
                      aria-pressed={isSelected}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      className={`rounded-[var(--radius)] border px-3.5 py-2 text-sm font-medium transition-all cursor-pointer ${
                        isSelected
                          ? "border-[var(--blue-accent)] bg-[var(--blue-accent)] text-white shadow-[0_0_0_3px_rgba(79,86,232,0.15)]"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--blue-accent)] hover:text-[var(--blue-accent)]"
                      }`}
                    >
                      {formatNYTime(slot.start)}
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
