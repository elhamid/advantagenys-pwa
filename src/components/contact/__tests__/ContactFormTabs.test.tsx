import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect } from "vitest";

// Mock sub-forms so this test focuses purely on tab switching
vi.mock("../ContactForm", () => ({
  ContactForm: () => <div data-testid="contact-form">ContactForm</div>,
}));

vi.mock("../BookingForm", () => ({
  BookingForm: () => <div data-testid="booking-form">BookingForm</div>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

import { ContactFormTabs } from "../ContactFormTabs";

describe("ContactFormTabs", () => {
  // --- Default state ---

  it("shows ContactForm by default (Send Message tab is active)", () => {
    render(<ContactFormTabs />);
    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
    expect(screen.queryByTestId("booking-form")).not.toBeInTheDocument();
  });

  it("renders both tab buttons", () => {
    render(<ContactFormTabs />);
    expect(screen.getByRole("button", { name: "Send Message" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Book Appointment" })).toBeInTheDocument();
  });

  it("Send Message tab is initially active (has blue accent background)", () => {
    render(<ContactFormTabs />);
    const sendBtn = screen.getByRole("button", { name: "Send Message" });
    expect(sendBtn.className).toContain("bg-[var(--blue-accent)]");
    expect(sendBtn.className).toContain("text-white");
  });

  it("Book Appointment tab is initially inactive", () => {
    render(<ContactFormTabs />);
    const bookBtn = screen.getByRole("button", { name: "Book Appointment" });
    expect(bookBtn.className).not.toContain("bg-[var(--blue-accent)]");
    expect(bookBtn.className).toContain("text-[var(--text-secondary)]");
  });

  // --- Tab switching ---

  it("switches to BookingForm when Book Appointment tab is clicked", async () => {
    const user = userEvent.setup();
    render(<ContactFormTabs />);

    await user.click(screen.getByRole("button", { name: "Book Appointment" }));

    expect(screen.getByTestId("booking-form")).toBeInTheDocument();
    expect(screen.queryByTestId("contact-form")).not.toBeInTheDocument();
  });

  it("Book Appointment tab becomes active after clicking", async () => {
    const user = userEvent.setup();
    render(<ContactFormTabs />);

    await user.click(screen.getByRole("button", { name: "Book Appointment" }));

    const bookBtn = screen.getByRole("button", { name: "Book Appointment" });
    expect(bookBtn.className).toContain("bg-[var(--blue-accent)]");
    expect(bookBtn.className).toContain("text-white");
  });

  it("Send Message tab becomes inactive after switching to Book Appointment", async () => {
    const user = userEvent.setup();
    render(<ContactFormTabs />);

    await user.click(screen.getByRole("button", { name: "Book Appointment" }));

    const sendBtn = screen.getByRole("button", { name: "Send Message" });
    expect(sendBtn.className).not.toContain("bg-[var(--blue-accent)]");
  });

  it("switches back to ContactForm when Send Message tab is clicked again", async () => {
    const user = userEvent.setup();
    render(<ContactFormTabs />);

    // Go to booking
    await user.click(screen.getByRole("button", { name: "Book Appointment" }));
    expect(screen.getByTestId("booking-form")).toBeInTheDocument();

    // Go back to contact
    await user.click(screen.getByRole("button", { name: "Send Message" }));
    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
    expect(screen.queryByTestId("booking-form")).not.toBeInTheDocument();
  });
});
