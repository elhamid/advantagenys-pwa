/**
 * Thin client for taskboard's public booking API.
 *
 * Inert mode (NEXT_PUBLIC_BOOK_LIVE !== "true"):
 *   - BOOK_LIVE === false
 *   - fetchSlots / confirmBooking should not be called; BookingFlow falls back to /api/contact
 *
 * Live mode (NEXT_PUBLIC_BOOK_LIVE === "true"):
 *   - Calls https://app.advantagenys.com/api/book/slots and /api/book/confirm
 *
 * No business logic lives here. taskboard owns the domain.
 */

const RAW_LIVE = process.env.NEXT_PUBLIC_BOOK_LIVE;
const RAW_BASE = process.env.NEXT_PUBLIC_BOOK_API_BASE;

/** True only when env var is explicitly set to the string "true". */
export const BOOK_LIVE: boolean = RAW_LIVE === "true";

/** Base URL for taskboard booking API. */
const BASE_URL = RAW_BASE ?? "https://app.advantagenys.com";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Slot {
  start: string; // ISO UTC
  end: string;   // ISO UTC
  assignee_user_id: string;
}

export interface SlotsResponse {
  slots: Slot[];
  assignee_initials: string;
}

export interface ConfirmBookingArgs {
  service: string;
  slot_start: string;
  slot_end: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

export interface ConfirmBookingResponse {
  confirmation_id: string;
}

// ---------------------------------------------------------------------------
// Typed errors
// ---------------------------------------------------------------------------

/** Slot was taken between the user loading the grid and submitting. */
export class SlotConflictError extends Error {
  readonly type = "SlotConflictError" as const;
  constructor() {
    super("That time was just booked — pick another below.");
    this.name = "SlotConflictError";
  }
}

/** Invalid request — server returned a 400 with a message. */
export class BookingValidationError extends Error {
  readonly type = "BookingValidationError" as const;
  constructor(message: string) {
    super(message);
    this.name = "BookingValidationError";
  }
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

/**
 * Fetch available slots for a service within a date range.
 * @param service - Service slug (normalized to lowercase before send)
 * @param from    - YYYY-MM-DD (NY date)
 * @param to      - YYYY-MM-DD (NY date)
 */
export async function fetchSlots({
  service,
  from,
  to,
}: {
  service: string;
  from: string;
  to: string;
}): Promise<SlotsResponse> {
  const params = new URLSearchParams({
    service: service.toLowerCase(),
    from,
    to,
  });

  const res = await fetch(`${BASE_URL}/api/book/slots?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    // Cache 60s (matches taskboard's Cache-Control: private, max-age=60)
    next: { revalidate: 60 },
  } as RequestInit);

  if (!res.ok) {
    throw new Error(`Slots request failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<SlotsResponse>;
}

/**
 * Confirm a booking.
 *
 * Throws:
 *  - SlotConflictError on 409
 *  - BookingValidationError on 400
 *  - Error on other non-201 responses
 */
export async function confirmBooking(
  args: ConfirmBookingArgs
): Promise<ConfirmBookingResponse> {
  const body = {
    service: args.service.toLowerCase(),
    slot_start: args.slot_start,
    slot_end: args.slot_end,
    name: args.name,
    email: args.email,
    ...(args.phone ? { phone: args.phone } : {}),
    ...(args.notes ? { notes: args.notes } : {}),
  };

  const res = await fetch(`${BASE_URL}/api/book/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status === 409) {
    throw new SlotConflictError();
  }

  if (res.status === 400) {
    let message = "Invalid booking request.";
    try {
      const data = (await res.json()) as { error?: string; message?: string };
      message = data.error ?? data.message ?? message;
    } catch {
      // ignore parse error
    }
    throw new BookingValidationError(message);
  }

  if (res.status !== 201) {
    throw new Error(`Booking confirmation failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { confirmation_id?: string; appointment_id?: string };

  // Taskboard returns { confirmation_id } per the handover contract.
  // Defensive fallback for appointment_id if shape changes.
  const id = data.confirmation_id ?? data.appointment_id;
  if (!id) {
    throw new Error("Booking confirmed but no confirmation ID returned.");
  }

  return { confirmation_id: id };
}
