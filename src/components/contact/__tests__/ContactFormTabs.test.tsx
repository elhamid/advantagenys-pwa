import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, afterEach } from "vitest";

// Mock sub-forms so this test focuses purely on card switching
vi.mock("../ContactForm", () => ({
  ContactForm: () => <div data-testid="contact-form">ContactForm</div>,
}));

// BookAppointmentTrigger just renders the BookingForm in form mode (default)
vi.mock("../BookAppointmentTrigger", () => ({
  BookAppointmentTrigger: () => <div data-testid="booking-trigger">BookAppointmentTrigger</div>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

// Mock analytics to track calls
vi.mock("@/lib/analytics/events", () => ({
  bookingTriggerOpen: vi.fn(),
}));

import * as events from "@/lib/analytics/events";
import { ContactFormTabs } from "../ContactFormTabs";

afterEach(() => {
  vi.clearAllMocks();
  // Reset URL search params after each test
  window.history.replaceState({}, "", window.location.pathname);
});

describe("ContactFormTabs", () => {
  // ---------------------------------------------------------------------------
  // Default state — both cards collapsed
  // ---------------------------------------------------------------------------

  it("renders with both cards collapsed by default", () => {
    render(<ContactFormTabs />);
    expect(screen.queryByTestId("contact-form")).not.toBeInTheDocument();
    expect(screen.queryByTestId("booking-trigger")).not.toBeInTheDocument();
  });

  it("renders the primary booking card header button", () => {
    render(<ContactFormTabs />);
    expect(
      screen.getByRole("button", { name: /book an appointment/i })
    ).toBeInTheDocument();
  });

  it("renders the secondary message card header button", () => {
    render(<ContactFormTabs />);
    expect(
      screen.getByRole("button", { name: /send a message/i })
    ).toBeInTheDocument();
  });

  it("booking card header button starts with aria-expanded false", () => {
    render(<ContactFormTabs />);
    const btn = screen.getByRole("button", { name: /book an appointment/i });
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  it("message card header button starts with aria-expanded false", () => {
    render(<ContactFormTabs />);
    const btn = screen.getByRole("button", { name: /send a message/i });
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  // ---------------------------------------------------------------------------
  // Booking card expansion
  // ---------------------------------------------------------------------------

  it("clicking the primary booking card header expands the booking panel (aria-expanded=true)", async () => {
    const user = userEvent.setup();
    render(<ContactFormTabs />);

    const btn = screen.getByRole("button", { name: /book an appointment/i });
    await user.click(btn);

    expect(btn).toHaveAttribute("aria-expanded", "true");
  });

  it("booking panel renders BookAppointmentTrigger after expanding", async () => {
    const user = userEvent.setup();
    render(<ContactFormTabs />);

    await user.click(screen.getByRole("button", { name: /book an appointment/i }));

    await waitFor(() => {
      expect(screen.getByTestId("booking-trigger")).toBeInTheDocument();
    });
  });

  it("fires bookingTriggerOpen analytics when booking card is opened", async () => {
    const user = userEvent.setup();
    render(<ContactFormTabs />);

    await user.click(screen.getByRole("button", { name: /book an appointment/i }));

    expect(events.bookingTriggerOpen).toHaveBeenCalledOnce();
  });

  it("does NOT fire bookingTriggerOpen when booking card is collapsed (second click)", async () => {
    const user = userEvent.setup();
    render(<ContactFormTabs />);

    const btn = screen.getByRole("button", { name: /book an appointment/i });
    await user.click(btn); // open
    await user.click(btn); // close

    // Only fired once (on open)
    expect(events.bookingTriggerOpen).toHaveBeenCalledOnce();
  });

  it("clicking booking card twice collapses it (aria-expanded=false)", async () => {
    const user = userEvent.setup();
    render(<ContactFormTabs />);

    const btn = screen.getByRole("button", { name: /book an appointment/i });
    await user.click(btn);
    await user.click(btn);

    await waitFor(() => {
      expect(btn).toHaveAttribute("aria-expanded", "false");
    });
  });

  // ---------------------------------------------------------------------------
  // Service pills inside the booking card
  // ---------------------------------------------------------------------------

  it("service pills appear inside the booking card when expanded", async () => {
    const user = userEvent.setup();
    render(<ContactFormTabs />);

    await user.click(screen.getByRole("button", { name: /book an appointment/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Tax" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "ITIN" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Formation" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Insurance" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Consulting" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Other" })).toBeInTheDocument();
    });
  });

  it("service pill toggles aria-pressed when clicked", async () => {
    const user = userEvent.setup();
    render(<ContactFormTabs />);

    await user.click(screen.getByRole("button", { name: /book an appointment/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Tax" })).toBeInTheDocument();
    });

    const taxPill = screen.getByRole("button", { name: "Tax" });
    expect(taxPill).toHaveAttribute("aria-pressed", "false");

    await user.click(taxPill);
    expect(taxPill).toHaveAttribute("aria-pressed", "true");

    await user.click(taxPill);
    expect(taxPill).toHaveAttribute("aria-pressed", "false");
  });

  // ---------------------------------------------------------------------------
  // Message card expansion
  // ---------------------------------------------------------------------------

  it("clicking the secondary message card header expands the message panel (aria-expanded=true)", async () => {
    const user = userEvent.setup();
    render(<ContactFormTabs />);

    const btn = screen.getByRole("button", { name: /send a message/i });
    await user.click(btn);

    expect(btn).toHaveAttribute("aria-expanded", "true");
  });

  it("message panel renders ContactForm after expanding", async () => {
    const user = userEvent.setup();
    render(<ContactFormTabs />);

    await user.click(screen.getByRole("button", { name: /send a message/i }));

    await waitFor(() => {
      expect(screen.getByTestId("contact-form")).toBeInTheDocument();
    });
  });

  it("clicking message card twice collapses it", async () => {
    const user = userEvent.setup();
    render(<ContactFormTabs />);

    const btn = screen.getByRole("button", { name: /send a message/i });
    await user.click(btn);
    await user.click(btn);

    await waitFor(() => {
      expect(btn).toHaveAttribute("aria-expanded", "false");
    });
  });

  // ---------------------------------------------------------------------------
  // Deep-link: ?tab=booking opens booking card on mount
  // ---------------------------------------------------------------------------

  it("?tab=booking deep-link opens the booking card on mount", async () => {
    window.history.replaceState({}, "", "/?tab=booking");

    render(<ContactFormTabs />);

    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /book an appointment/i });
      expect(btn).toHaveAttribute("aria-expanded", "true");
    });

    await waitFor(() => {
      expect(screen.getByTestId("booking-trigger")).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Deep-link: ?tab=message opens message card on mount
  // ---------------------------------------------------------------------------

  it("?tab=message deep-link opens the message card on mount", async () => {
    window.history.replaceState({}, "", "/?tab=message");

    render(<ContactFormTabs />);

    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /send a message/i });
      expect(btn).toHaveAttribute("aria-expanded", "true");
    });

    await waitFor(() => {
      expect(screen.getByTestId("contact-form")).toBeInTheDocument();
    });
  });
});
