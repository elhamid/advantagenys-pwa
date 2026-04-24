import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect } from "vitest";

// Mock sub-forms so this test focuses purely on card expand/collapse
vi.mock("../ContactForm", () => ({
  ContactForm: () => <div data-testid="contact-form">ContactForm</div>,
}));

vi.mock("../BookAppointmentTrigger", () => ({
  BookAppointmentTrigger: () => <div data-testid="booking-trigger">BookAppointmentTrigger</div>,
}));

// Also mock BookingForm in case it's transitively imported
vi.mock("../BookingForm", () => ({
  BookingForm: () => <div data-testid="booking-form">BookingForm</div>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

vi.mock("@/lib/analytics/events", () => ({
  bookingTriggerOpen: vi.fn(),
  bookingSubmit: vi.fn(),
  bookingRedirectClick: vi.fn(),
  bookingIframeOpen: vi.fn(),
  bookingIframeConfirmed: vi.fn(),
  messageSubmit: vi.fn(),
}));

import { ContactFormTabs } from "../ContactFormTabs";

describe("ContactFormTabs", () => {
  // --- Default state: both cards collapsed ---

  it("renders both card headers on load", () => {
    render(<ContactFormTabs />);
    expect(screen.getByText("Book an appointment")).toBeInTheDocument();
    expect(screen.getByText("Send a message")).toBeInTheDocument();
  });

  it("neither card body is visible by default", () => {
    render(<ContactFormTabs />);
    expect(screen.queryByTestId("booking-trigger")).not.toBeInTheDocument();
    expect(screen.queryByTestId("contact-form")).not.toBeInTheDocument();
  });

  it("shows the Recommended pill on the Book card", () => {
    render(<ContactFormTabs />);
    expect(screen.getByText(/recommended/i)).toBeInTheDocument();
  });

  // --- Expanding cards ---

  it("expands BookAppointmentTrigger when Book card header is clicked", async () => {
    const user = userEvent.setup();
    render(<ContactFormTabs />);

    await user.click(screen.getByRole("button", { name: /book an appointment/i }));

    expect(screen.getByTestId("booking-trigger")).toBeInTheDocument();
    expect(screen.queryByTestId("contact-form")).not.toBeInTheDocument();
  });

  it("expands ContactForm when Send Message card header is clicked", async () => {
    const user = userEvent.setup();
    render(<ContactFormTabs />);

    await user.click(screen.getByRole("button", { name: /send a message/i }));

    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
    expect(screen.queryByTestId("booking-trigger")).not.toBeInTheDocument();
  });

  // --- Collapse ---

  it("collapses the booking card when clicked again", async () => {
    const user = userEvent.setup();
    render(<ContactFormTabs />);

    await user.click(screen.getByRole("button", { name: /book an appointment/i }));
    expect(screen.getByTestId("booking-trigger")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /book an appointment/i }));
    expect(screen.queryByTestId("booking-trigger")).not.toBeInTheDocument();
  });

  // --- Switching between cards ---

  it("switches from booking to message card when message header is clicked", async () => {
    const user = userEvent.setup();
    render(<ContactFormTabs />);

    await user.click(screen.getByRole("button", { name: /book an appointment/i }));
    expect(screen.getByTestId("booking-trigger")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /send a message/i }));
    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
    expect(screen.queryByTestId("booking-trigger")).not.toBeInTheDocument();
  });

  // --- aria-expanded ---

  it("sets aria-expanded=true on the open card header", async () => {
    const user = userEvent.setup();
    render(<ContactFormTabs />);

    const bookBtn = screen.getByRole("button", { name: /book an appointment/i });
    expect(bookBtn).toHaveAttribute("aria-expanded", "false");

    await user.click(bookBtn);
    expect(bookBtn).toHaveAttribute("aria-expanded", "true");
  });
});
