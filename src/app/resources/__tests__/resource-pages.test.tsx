import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ResourcesPage, { metadata as resourcesMetadata } from "../page";
import KioskPage, { metadata as kioskMetadata } from "../kiosk/page";
import KioskLayout from "../kiosk/layout";

vi.mock("@/components/ui/Container", () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/resources/FormsGrid", () => ({
  FormsGrid: ({ kioskMode }: { kioskMode?: boolean }) => (
    <div data-testid="forms-grid">{kioskMode ? "kiosk" : "default"}</div>
  ),
}));

describe("Resources pages", () => {
  it("renders the client resources page", () => {
    expect(resourcesMetadata.title).toBe("Client Resources");

    render(<ResourcesPage />);

    expect(screen.getByRole("heading", { name: /client resources/i })).toBeInTheDocument();
    expect(screen.getByText(/find the right form, fill it out online, and submit securely/i)).toBeInTheDocument();
    expect(screen.getByTestId("forms-grid")).toHaveTextContent("default");
  });

  it("renders the staff kiosk page with noindex metadata", () => {
    expect(kioskMetadata.title).toBe("Forms Kiosk");
    expect(kioskMetadata.robots).toEqual({ index: false, follow: false });

    render(<KioskPage />);

    expect(screen.getByRole("heading", { name: /^forms$/i })).toBeInTheDocument();
    expect(screen.getByText(/tap share to send a form link to a customer/i)).toBeInTheDocument();
    expect(screen.getByTestId("forms-grid")).toHaveTextContent("kiosk");
  });

  it("passes children through the kiosk layout unchanged", () => {
    render(
      <KioskLayout>
        <span>Layout child</span>
      </KioskLayout>
    );

    expect(screen.getByText("Layout child")).toBeInTheDocument();
  });
});
