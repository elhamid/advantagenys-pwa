import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TermsPage, { metadata } from "../page";

vi.mock("@/components/ui/Container", () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("TermsPage", () => {
  it("exports terms metadata", () => {
    expect(metadata.title).toBe("Terms of Service");
    expect(metadata.description).toMatch(/business consulting services/i);
  });

  it("renders the terms page heading and website link", () => {
    render(<TermsPage />);

    expect(screen.getByRole("heading", { name: /terms of service/i })).toBeInTheDocument();
    expect(screen.getByText(/last updated: march 2026/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /advantagenys\.com/i })[0]).toHaveAttribute(
      "href",
      "https://advantagenys.com"
    );
  });
});
