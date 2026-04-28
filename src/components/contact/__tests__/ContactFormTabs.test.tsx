import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, afterEach } from "vitest";

// Mock sub-form so this test focuses purely on the accordion behavior
vi.mock("../ContactForm", () => ({
  ContactForm: () => <div data-testid="contact-form">ContactForm</div>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/contact",
}));

import { ContactFormTabs } from "../ContactFormTabs";

afterEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, "", window.location.pathname);
});

describe("ContactFormTabs", () => {
  // ---------------------------------------------------------------------------
  // Default state
  // ---------------------------------------------------------------------------

  it("renders without crashing", () => {
    render(<ContactFormTabs />);
  });

  it("shows the Book Appointment CTA linking to /book", () => {
    render(<ContactFormTabs />);
    const bookLink = screen.getByRole("link", { name: /schedule now/i });
    expect(bookLink).toBeInTheDocument();
    expect(bookLink).toHaveAttribute("href", "/book");
  });

  it("shows the Send a message card header button", () => {
    render(<ContactFormTabs />);
    expect(
      screen.getByRole("button", { name: /send a message/i })
    ).toBeInTheDocument();
  });

  it("message card starts collapsed (aria-expanded false)", () => {
    render(<ContactFormTabs />);
    const btn = screen.getByRole("button", { name: /send a message/i });
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  it("contact form is not visible before expanding", () => {
    render(<ContactFormTabs />);
    expect(screen.queryByTestId("contact-form")).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Message card expansion
  // ---------------------------------------------------------------------------

  it("clicking the message card header expands it (aria-expanded=true)", async () => {
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

  it("clicking message card twice collapses it (aria-expanded=false)", async () => {
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
  // Booking tab removed — no orphan booking UI in this component
  // ---------------------------------------------------------------------------

  it("does NOT render any booking-form trigger in this component (booking is at /book)", () => {
    render(<ContactFormTabs />);
    // BookingForm / BookAppointmentTrigger should not be rendered here
    expect(screen.queryByTestId("booking-trigger")).not.toBeInTheDocument();
    expect(screen.queryByText(/book an appointment/i, { selector: "button" })).not.toBeInTheDocument();
  });
});
