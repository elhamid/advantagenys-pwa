import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Page, { metadata } from "../page";

vi.mock("@/components/ui/Container", () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/ui/Card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/ui/Badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));
vi.mock("@/components/ui/Button", () => ({
  Button: ({ href, children }: { href?: string; children: React.ReactNode }) =>
    href ? <a href={href}>{children}</a> : <button type="button">{children}</button>,
}));
vi.mock("@/components/seo/JsonLd", () => ({ JsonLd: () => null }));

describe("ImmigrantEntrepreneursPage", () => {
  it("exports immigrant entrepreneur metadata", () => {
    expect(metadata.title).toMatch(/immigrant entrepreneur services/i);
  });

  it("renders the immigrant entrepreneur hero and CTA", () => {
    render(<Page />);

    expect(screen.getByRole("heading", { level: 1, name: /2,250\+ itins processed/i })).toBeInTheDocument();
    expect(screen.getByText(/we understand your challenges/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /get your itin/i })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: /get your itin/i })[0]).toHaveAttribute("href", "/contact");
  });
});
