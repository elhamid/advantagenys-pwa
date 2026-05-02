import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must be before any import that references these modules
// ---------------------------------------------------------------------------

const mockRouterPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/book",
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...filterDomProps(props)}>{children}</div>
    ),
    button: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <button {...filterDomProps(props)}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

function filterDomProps(props: Record<string, unknown>) {
  const filtered: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(props)) {
    if (
      ![
        "initial",
        "animate",
        "exit",
        "transition",
        "variants",
        "whileHover",
        "whileTap",
        "layout",
        "mode",
      ].includes(key)
    ) {
      filtered[key] = val;
    }
  }
  return filtered;
}

// Mock booking-realtime
vi.mock("@/lib/booking-realtime", () => ({
  bookingSupabase: null,
}));

// Mock fetchSlots to return slots immediately
const mockFetchSlots = vi.fn().mockResolvedValue({
  slots: [
    {
      start: "2026-05-02T13:00:00Z",
      end: "2026-05-02T13:20:00Z",
      assignee_user_id: "u1",
    },
  ],
  assignee_initials: "KP",
});

const mockConfirmBooking = vi.fn();

// We need to control BOOK_LIVE per test, so we use a mutable variable
let mockBookLive = true;

vi.mock("@/lib/booking-client", () => ({
  get BOOK_LIVE() {
    return mockBookLive;
  },
  fetchSlots: (...args: unknown[]) => mockFetchSlots(...args),
  confirmBooking: (...args: unknown[]) => mockConfirmBooking(...args),
  SlotConflictError: class SlotConflictError extends Error {
    readonly type = "SlotConflictError" as const;
    readonly alternatives: unknown[];
    constructor(alternatives: unknown[] = []) {
      super("That time was just booked — pick another below.");
      this.name = "SlotConflictError";
      this.alternatives = alternatives;
    }
  },
}));

import { BookingFlow } from "../BookingFlow";

beforeEach(() => {
  mockBookLive = true;
  mockRouterPush.mockReset();
  mockConfirmBooking.mockReset();
  mockFetchSlots.mockReset().mockResolvedValue({
    slots: [
      {
        start: "2026-05-02T13:00:00Z",
        end: "2026-05-02T13:20:00Z",
        assignee_user_id: "u1",
      },
    ],
    assignee_initials: "KP",
  });
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("BookingFlow", () => {
  // ---------------------------------------------------------------------------
  // Step 1: ServicePicker
  // ---------------------------------------------------------------------------

  it("renders step 1 (ServicePicker) initially", () => {
    render(<BookingFlow />);

    expect(
      screen.getByText(/what can we help you with/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Tax Services")).toBeInTheDocument();
    expect(screen.getByText("ITIN / Tax ID")).toBeInTheDocument();
  });

  it("shows Continue button disabled when no service selected", () => {
    render(<BookingFlow />);

    const continueBtn = screen.getByRole("button", { name: /continue/i });
    expect(continueBtn).toBeDisabled();
  });

  it("enables Continue button after selecting a service", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<BookingFlow />);

    await user.click(screen.getByText("Tax Services"));

    const continueBtn = screen.getByRole("button", { name: /continue/i });
    expect(continueBtn).not.toBeDisabled();
  });

  // ---------------------------------------------------------------------------
  // Step indicator
  // ---------------------------------------------------------------------------

  it("shows 3 steps when BOOK_LIVE is true", () => {
    mockBookLive = true;
    render(<BookingFlow />);

    expect(screen.getByText("Service")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
  });

  it("shows 2 steps when BOOK_LIVE is false (no Time step)", () => {
    mockBookLive = false;
    render(<BookingFlow />);

    expect(screen.getByText("Service")).toBeInTheDocument();
    expect(screen.queryByText("Time")).not.toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Navigation: Live mode (service -> slots -> contact)
  // ---------------------------------------------------------------------------

  it("navigates to step 2 (slot grid) in live mode after selecting service and clicking Continue", async () => {
    mockBookLive = true;
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<BookingFlow />);

    await user.click(screen.getByText("Tax Services"));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/pick a time/i)).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Navigation: Inert mode (service -> contact directly)
  // ---------------------------------------------------------------------------

  it("navigates to step 2 (contact form) in inert mode, skipping slot grid", async () => {
    mockBookLive = false;
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<BookingFlow />);

    await user.click(screen.getByText("Tax Services"));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/your details/i)).toBeInTheDocument();
    });

    // Should show the inert-mode copy
    expect(
      screen.getByText(/tell us how to reach you/i)
    ).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Back button
  // ---------------------------------------------------------------------------

  it("back button returns to step 1 from step 2 (live mode)", async () => {
    mockBookLive = true;
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<BookingFlow />);

    // Go to step 2
    await user.click(screen.getByText("Tax Services"));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/pick a time/i)).toBeInTheDocument();
    });

    // Click Back
    await user.click(
      screen.getByRole("button", { name: /back to service selection/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/what can we help you with/i)
      ).toBeInTheDocument();
    });
  });

  it("back button returns to step 1 from step 2 (inert mode)", async () => {
    mockBookLive = false;
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<BookingFlow />);

    await user.click(screen.getByText("Tax Services"));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/your details/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /go back/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/what can we help you with/i)
      ).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Free consultation copy
  // ---------------------------------------------------------------------------

  it("shows 20-minute consult copy on step 1", () => {
    render(<BookingFlow />);
    expect(screen.getByText(/20-minute consult, free/i)).toBeInTheDocument();
  });
});
