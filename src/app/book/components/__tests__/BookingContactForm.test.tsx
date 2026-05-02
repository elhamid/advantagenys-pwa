import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect } from "vitest";
import { BookingContactForm } from "../BookingContactForm";

describe("BookingContactForm", () => {
  const defaultProps = {
    onSubmit: vi.fn().mockResolvedValue(undefined),
    loading: false,
    error: null,
    isInertMode: false,
  };

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  it("renders all required fields (name, email, phone)", () => {
    render(<BookingContactForm {...defaultProps} />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
  });

  it("renders the optional notes field", () => {
    render(<BookingContactForm {...defaultProps} />);
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it('shows "Confirm Booking" button in live mode', () => {
    render(<BookingContactForm {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /confirm booking/i })
    ).toBeInTheDocument();
  });

  it('shows "Request Appointment" button in inert mode', () => {
    render(<BookingContactForm {...defaultProps} isInertMode={true} />);
    expect(
      screen.getByRole("button", { name: /request appointment/i })
    ).toBeInTheDocument();
  });

  it("displays the free consultation copy", () => {
    render(<BookingContactForm {...defaultProps} />);
    expect(screen.getByText(/free 20-minute consult/i)).toBeInTheDocument();
  });

  it("shows inert mode banner with service label", () => {
    render(
      <BookingContactForm
        {...defaultProps}
        isInertMode={true}
        serviceLabel="Tax Services"
      />
    );
    expect(
      screen.getByText(/tax services consult request/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/we will reach out within 24 hours/i)
    ).toBeInTheDocument();
  });

  it("shows generic inert banner when no service label provided", () => {
    render(
      <BookingContactForm {...defaultProps} isInertMode={true} />
    );
    expect(screen.getByText(/consult request/i)).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  it("does not call onSubmit when required fields are empty", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<BookingContactForm {...defaultProps} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /confirm booking/i }));

    // Validation should show errors instead of submitting
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows email validation error for invalid email", async () => {
    const user = userEvent.setup();
    render(<BookingContactForm {...defaultProps} />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "not-an-email");
    await user.tab(); // blur to trigger touch

    await waitFor(() => {
      expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it("shows phone validation error for short phone number", async () => {
    const user = userEvent.setup();
    render(<BookingContactForm {...defaultProps} />);

    const phoneInput = screen.getByLabelText(/phone/i);
    await user.type(phoneInput, "123");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/enter a valid phone number/i)).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Submission
  // ---------------------------------------------------------------------------

  it("calls onSubmit with form data when all fields are valid", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<BookingContactForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/phone/i), "9299331396");
    await user.type(screen.getByLabelText(/notes/i), "Need help with W-7");

    await user.click(screen.getByRole("button", { name: /confirm booking/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "9299331396",
        notes: "Need help with W-7",
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  it("shows loading state during submission", () => {
    render(<BookingContactForm {...defaultProps} loading={true} />);

    const button = screen.getByRole("button", { name: /confirming/i });
    expect(button).toBeDisabled();
    expect(screen.getByText(/confirming/i)).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------

  it("displays API error message", () => {
    render(
      <BookingContactForm
        {...defaultProps}
        error="Something went wrong. Please try again."
      />
    );

    expect(
      screen.getByText(/something went wrong/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
