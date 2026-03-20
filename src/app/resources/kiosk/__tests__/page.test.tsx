import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Page, { metadata } from "../page";

vi.mock("@/components/resources/FormsGrid", () => ({
  FormsGrid: ({ kioskMode }: { kioskMode?: boolean }) => (
    <div data-testid="forms-grid">{kioskMode ? "kiosk" : "default"}</div>
  ),
}));

describe("KioskPage", () => {
  it("exports kiosk metadata", () => {
    expect(metadata.title).toBe("Forms Kiosk");
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("renders kiosk instructions and kiosk grid mode", () => {
    render(<Page />);

    expect(screen.getByRole("heading", { name: /^forms$/i })).toBeInTheDocument();
    expect(screen.getByText(/tap share to send a form link to a customer/i)).toBeInTheDocument();
    expect(screen.getByTestId("forms-grid")).toHaveTextContent("kiosk");
  });
});
