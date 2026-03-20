import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PHONE } from "@/lib/constants";
import Page, { metadata } from "../page";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));
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

describe("ServicesPage", () => {
  it("exports services metadata", () => {
    expect(metadata.title).toBe("Services");
    expect(metadata.description).toMatch(/one firm, every service/i);
  });

  it("renders the services index and CTAs", () => {
    render(<Page />);

    expect(screen.getByRole("heading", { name: /every service your business needs\. one firm\./i })).toBeInTheDocument();
    expect(screen.getByText(/business formation/i)).toBeInTheDocument();
    expect(screen.getByText(/licensing & permits/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /free consultation/i })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: new RegExp(`call ${PHONE.main}`, "i") })).toHaveAttribute(
      "href",
      `tel:${PHONE.mainTel}`
    );
  });
});
