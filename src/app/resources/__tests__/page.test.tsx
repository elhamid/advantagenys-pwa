import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ResourcesPage, { metadata } from "../page";

vi.mock("@/components/ui/Container", () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/resources/FormsGrid", () => ({
  FormsGrid: () => <div data-testid="forms-grid">default</div>,
}));

describe("ResourcesPage", () => {
  it("exports resources metadata", () => {
    expect(metadata.title).toBe("Client Resources");
    expect(metadata.description).toMatch(/forms and documents/i);
  });

  it("renders the resources hero and forms grid", () => {
    render(<ResourcesPage />);

    expect(screen.getByRole("heading", { name: /client resources/i })).toBeInTheDocument();
    expect(screen.getByText(/find the right form, fill it out online, and submit securely/i)).toBeInTheDocument();
    expect(screen.getByTestId("forms-grid")).toHaveTextContent("default");
  });
});
