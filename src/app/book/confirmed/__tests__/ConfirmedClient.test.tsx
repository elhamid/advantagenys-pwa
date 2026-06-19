import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { ConfirmedClient } from "../ConfirmedClient";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock PushOptInPrompt — we just need to verify it renders or not
vi.mock("@/components/booking/PushOptInPrompt", () => ({
  PushOptInPrompt: ({ appointmentId }: { appointmentId?: string }) => (
    <div data-testid="push-opt-in" data-appointment-id={appointmentId}>
      PushOptInPrompt
    </div>
  ),
}));

describe("ConfirmedClient", () => {
  it("suppresses PushOptInPrompt in inert mode", () => {
    render(<ConfirmedClient isInert={true} appointmentId="abc-123" />);
    expect(screen.queryByTestId("push-opt-in")).not.toBeInTheDocument();
    expect(screen.getByText(/redirecting to home/i)).toBeInTheDocument();
  });

  it("renders PushOptInPrompt in live mode", () => {
    render(<ConfirmedClient isInert={false} appointmentId="abc-123" />);
    expect(screen.getByTestId("push-opt-in")).toBeInTheDocument();
    expect(screen.getByText("PushOptInPrompt")).toBeInTheDocument();
  });

  it("passes appointmentId to PushOptInPrompt", () => {
    render(<ConfirmedClient isInert={false} appointmentId="xyz-789" />);
    expect(screen.getByTestId("push-opt-in")).toHaveAttribute(
      "data-appointment-id",
      "xyz-789"
    );
  });

  it("renders PushOptInPrompt without appointmentId when not provided", () => {
    render(<ConfirmedClient isInert={false} />);
    expect(screen.getByTestId("push-opt-in")).toBeInTheDocument();
  });

  it("does not render PushOptInPrompt even with appointmentId in inert mode", () => {
    render(<ConfirmedClient isInert={true} appointmentId="xyz-789" />);
    expect(screen.queryByTestId("push-opt-in")).not.toBeInTheDocument();
  });
});
