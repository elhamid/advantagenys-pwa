import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Page, { metadata } from "../page";

vi.mock("next/link", () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }));
vi.mock("@/components/ui/Container", () => ({ Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/ui/Card", () => ({ Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/ui/Badge", () => ({ Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span> }));
vi.mock("@/components/ui/Button", () => ({ Button: ({ href, children }: { href?: string; children: React.ReactNode }) => href ? <a href={href}>{children}</a> : <button type="button">{children}</button> }));
vi.mock("@/components/seo/JsonLd", () => ({ JsonLd: () => <div data-testid="jsonld" /> }));
vi.mock("@/components/seo/FAQSection", () => ({ FAQSection: ({ faqs }: { faqs: Array<{ question: string }> }) => <div data-testid="faq-section">{faqs.length}</div> }));
vi.mock("@/lib/chat/get-faqs", () => ({ getServiceFAQs: vi.fn().mockResolvedValue([{ question: "How much?", answer: "Varies." }]) }));

describe("FinancialServicesPage", () => {
  it("exports financial services metadata", () => {
    expect(metadata.title).toBeTruthy();
  });

  it("renders the financial services hero and FAQ block", async () => {
    render(await Page());

    expect(screen.getByRole("heading", { name: /keep your books clean, your finances clear/i })).toBeInTheDocument();
    expect(screen.getByTestId("faq-section")).toBeInTheDocument();
  });
});
