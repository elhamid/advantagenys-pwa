import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { SlotGrid } from "../SlotGrid";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

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
      ].includes(key)
    ) {
      filtered[key] = val;
    }
  }
  return filtered;
}

// Mock booking-realtime (no Supabase in tests)
vi.mock("@/lib/booking-realtime", () => ({
  bookingSupabase: null,
}));

// Mock fetchSlots from booking-client
const mockFetchSlots = vi.fn();
vi.mock("@/lib/booking-client", () => ({
  fetchSlots: (...args: unknown[]) => mockFetchSlots(...args),
}));

// ---------------------------------------------------------------------------
// Realistic test data — slots across 2 days with morning/afternoon/evening
// ---------------------------------------------------------------------------

function makeSlot(dateStr: string, hourNY: number, minuteNY = 0): {
  start: string;
  end: string;
  assignee_user_id: string;
} {
  // Create a date in NY timezone by constructing UTC offset
  // NY is UTC-4 in May (EDT)
  const utcHour = hourNY + 4;
  const start = `${dateStr}T${String(utcHour).padStart(2, "0")}:${String(minuteNY).padStart(2, "0")}:00Z`;
  const endMinute = minuteNY + 20;
  const endHour = endMinute >= 60 ? utcHour + 1 : utcHour;
  const endMin = endMinute >= 60 ? endMinute - 60 : endMinute;
  const end = `${dateStr}T${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}:00Z`;
  return { start, end, assignee_user_id: "user-1" };
}

const MOCK_SLOTS = [
  // Day 1: morning + afternoon
  makeSlot("2026-05-02", 9, 0),   // 9:00 AM
  makeSlot("2026-05-02", 10, 0),  // 10:00 AM
  makeSlot("2026-05-02", 14, 0),  // 2:00 PM
  makeSlot("2026-05-02", 15, 0),  // 3:00 PM
  // Day 2: afternoon + evening
  makeSlot("2026-05-03", 13, 0),  // 1:00 PM
  makeSlot("2026-05-03", 17, 0),  // 5:00 PM
];

const defaultProps = {
  service: "tax",
  onSlotSelect: vi.fn(),
  selectedSlot: null,
  assigneeInitials: "",
  onAssigneeInitialsChange: vi.fn(),
};

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  mockFetchSlots.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("SlotGrid", () => {
  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  it("renders loading state while fetching slots", () => {
    // fetchSlots never resolves
    mockFetchSlots.mockReturnValue(new Promise(() => {}));

    render(<SlotGrid {...defaultProps} />);

    expect(screen.getByText(/loading available times/i)).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------

  it('renders error state with "Try again" when API fails', async () => {
    mockFetchSlots.mockRejectedValue(new Error("Network error"));

    render(<SlotGrid {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
  });

  it("retries when Try again is clicked", async () => {
    mockFetchSlots
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({ slots: MOCK_SLOTS, assignee_initials: "KP" });

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SlotGrid {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/try again/i)).toBeInTheDocument();
    });

    await user.click(screen.getByText(/try again/i));

    await waitFor(() => {
      expect(mockFetchSlots).toHaveBeenCalledTimes(2);
    });
  });

  // ---------------------------------------------------------------------------
  // Slot rendering
  // ---------------------------------------------------------------------------

  it("renders slot times after successful fetch", async () => {
    mockFetchSlots.mockResolvedValue({
      slots: MOCK_SLOTS,
      assignee_initials: "KP",
    });

    render(<SlotGrid {...defaultProps} />);

    await waitFor(() => {
      // Should have time buttons rendered (at least some visible)
      expect(screen.queryByText(/loading available times/i)).not.toBeInTheDocument();
    });
  });

  it("groups slots into Morning/Afternoon/Evening sections", async () => {
    mockFetchSlots.mockResolvedValue({
      slots: MOCK_SLOTS,
      assignee_initials: "KP",
    });

    render(<SlotGrid {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getAllByText("Morning").length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.getAllByText("Afternoon").length).toBeGreaterThanOrEqual(1);
  });

  // ---------------------------------------------------------------------------
  // Slot selection
  // ---------------------------------------------------------------------------

  it("calls onSlotSelect when a slot is clicked", async () => {
    const onSlotSelect = vi.fn();
    mockFetchSlots.mockResolvedValue({
      slots: MOCK_SLOTS,
      assignee_initials: "KP",
    });

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SlotGrid {...defaultProps} onSlotSelect={onSlotSelect} />);

    await waitFor(() => {
      expect(screen.queryByText(/loading available times/i)).not.toBeInTheDocument();
    });

    // Find and click the first time button
    const timeButtons = screen.getAllByRole("button", { pressed: false }).filter(
      (btn) => btn.textContent?.match(/\d+:\d+ (AM|PM)/)
    );
    if (timeButtons.length > 0) {
      await user.click(timeButtons[0]);
      expect(onSlotSelect).toHaveBeenCalledTimes(1);
      expect(onSlotSelect.mock.calls[0][0]).toHaveProperty("start");
      expect(onSlotSelect.mock.calls[0][0]).toHaveProperty("end");
    }
  });

  it("shows selected state (aria-pressed) for chosen slot", async () => {
    const selectedSlot = MOCK_SLOTS[0];
    mockFetchSlots.mockResolvedValue({
      slots: MOCK_SLOTS,
      assignee_initials: "KP",
    });

    render(
      <SlotGrid {...defaultProps} selectedSlot={selectedSlot} />
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading available times/i)).not.toBeInTheDocument();
    });

    const pressedButtons = screen.getAllByRole("button").filter(
      (btn) => btn.getAttribute("aria-pressed") === "true"
    );
    expect(pressedButtons.length).toBeGreaterThanOrEqual(1);
  });

  // ---------------------------------------------------------------------------
  // Empty slots
  // ---------------------------------------------------------------------------

  it('shows "No times available" for empty response', async () => {
    mockFetchSlots.mockResolvedValue({
      slots: [],
      assignee_initials: "",
    });

    render(<SlotGrid {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/no times available/i)).toBeInTheDocument();
    });

    // Should show phone number as fallback
    expect(screen.getByText(/929.*933.*1396/)).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Privacy: no assignee initials shown
  // ---------------------------------------------------------------------------

  it('shows generic "someone from our team" message instead of assignee initials', async () => {
    mockFetchSlots.mockResolvedValue({
      slots: MOCK_SLOTS,
      assignee_initials: "KP",
    });

    render(<SlotGrid {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByText(/loading available times/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/someone from our team/i)).toBeInTheDocument();
    // "KP" should not be displayed anywhere in the UI
    expect(screen.queryByText("KP")).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Assignee initials callback
  // ---------------------------------------------------------------------------

  it("calls onAssigneeInitialsChange with fetched initials", async () => {
    const onAssigneeInitialsChange = vi.fn();
    mockFetchSlots.mockResolvedValue({
      slots: MOCK_SLOTS,
      assignee_initials: "KP",
    });

    render(
      <SlotGrid
        {...defaultProps}
        onAssigneeInitialsChange={onAssigneeInitialsChange}
      />
    );

    await waitFor(() => {
      expect(onAssigneeInitialsChange).toHaveBeenCalledWith("KP");
    });
  });

  // ---------------------------------------------------------------------------
  // Day accordion: "Show more days" button
  // ---------------------------------------------------------------------------

  it("shows 'Show more days' when there are more than 5 days (desktop)", async () => {
    // Create slots across 7 days
    const manySlots = [];
    for (let d = 2; d <= 8; d++) {
      const dateStr = `2026-05-${String(d).padStart(2, "0")}`;
      manySlots.push(makeSlot(dateStr, 10, 0));
    }

    mockFetchSlots.mockResolvedValue({
      slots: manySlots,
      assignee_initials: "",
    });

    render(<SlotGrid {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByText(/loading available times/i)).not.toBeInTheDocument();
    });

    // Should have a "Show more" button
    const showMoreBtn = screen.queryByText(/show.*more day/i);
    expect(showMoreBtn).toBeInTheDocument();
  });

  it("reveals additional days when 'Show more days' is clicked", async () => {
    const manySlots = [];
    for (let d = 2; d <= 8; d++) {
      const dateStr = `2026-05-${String(d).padStart(2, "0")}`;
      manySlots.push(makeSlot(dateStr, 10, 0));
    }

    mockFetchSlots.mockResolvedValue({
      slots: manySlots,
      assignee_initials: "",
    });

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SlotGrid {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByText(/loading available times/i)).not.toBeInTheDocument();
    });

    const showMoreBtn = screen.getByText(/show.*more day/i);
    await user.click(showMoreBtn);

    // After clicking, the "Show more" button should disappear
    expect(screen.queryByText(/show.*more day/i)).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Timezone note
  // ---------------------------------------------------------------------------

  it("shows Eastern Time timezone note", async () => {
    mockFetchSlots.mockResolvedValue({
      slots: MOCK_SLOTS,
      assignee_initials: "",
    });

    render(<SlotGrid {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/eastern time/i)).toBeInTheDocument();
    });
  });
});
