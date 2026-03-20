import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PrivacyPage, { metadata } from "../page";

vi.mock("@/components/ui/Container", () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("PrivacyPage", () => {
  it("exports privacy metadata", () => {
    expect(metadata.title).toBe("Privacy Policy");
    expect(metadata.description).toMatch(/personal and business information/i);
  });

  it("renders the privacy content and external policy link", () => {
    render(<PrivacyPage />);

    expect(screen.getByRole("heading", { name: /privacy policy/i })).toBeInTheDocument();
    expect(screen.getByText(/we do not sell your personal information/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /jotform's privacy policy/i })).toHaveAttribute(
      "href",
      "https://www.jotform.com/privacy/"
    );
  });
});
