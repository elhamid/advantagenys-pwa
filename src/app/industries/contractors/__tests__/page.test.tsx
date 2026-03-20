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

describe("ContractorsPage", () => {
  it("exports contractors metadata", () => {
    expect(metadata.title).toMatch(/contractor business services/i);
  });

  it("renders the contractors hero and CTA", () => {
    render(<Page />);

    expect(screen.getByRole("heading", { name: /we handle the licensing maze/i })).toBeInTheDocument();
    expect(screen.getByText(/what keeps contractors up at night/i)).toBeInTheDocument();
    const ctas = screen.getAllByRole("link", { name: /get licensed today/i });
    expect(ctas).toHaveLength(2);
    expect(ctas[0]).toHaveAttribute("href", "/contact");
  });
});
