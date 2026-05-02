import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PHONE } from "@/lib/constants";
import ServicesPage, { metadata as servicesMetadata } from "../page";
import ServicesLoading from "../loading";
import BusinessFormationPage, { metadata as businessFormationMetadata } from "../business-formation/page";
import LicensingPage, { metadata as licensingMetadata } from "../licensing/page";
import InsurancePage, { metadata as insuranceMetadata } from "../insurance/page";
import AuditDefensePage, { metadata as auditDefenseMetadata } from "../audit-defense/page";
import FinancialServicesPage, { metadata as financialServicesMetadata } from "../financial-services/page";
import LegalServicesPage, { metadata as legalServicesMetadata } from "../legal/page";
import TaxServicesPage, { metadata as taxServicesMetadata } from "../tax-services/page";
import ItinTaxIdPage, { metadata as itinMetadata } from "../tax-services/itin-tax-id/page";

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

vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: ({ type }: { type: string }) => <div data-testid={`jsonld-${type}`} />,
}));

vi.mock("@/components/seo/FAQSection", () => ({
  FAQSection: ({ faqs }: { faqs: Array<{ question: string; answer: string }> }) => (
    <div data-testid="faq-section">{faqs.length}</div>
  ),
}));

vi.mock("@/lib/chat/get-faqs", () => ({
  getServiceFAQs: vi.fn().mockResolvedValue([
    { question: "How much does it cost?", answer: "Pricing varies by service." },
  ]),
}));

async function renderAsyncPage(page: () => Promise<React.ReactElement>) {
  return render(await page());
}

describe("Services pages", () => {
  it("renders the services index page", () => {
    expect(servicesMetadata.title).toBe("Services");
    expect(servicesMetadata.description).toMatch(/business formation|licensing|tax|insurance|audit defense/i);

    render(<ServicesPage />);

    expect(screen.getByRole("heading", { name: /every service your business needs\..*one firm\./i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /business formation/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /licensing & permits/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^tax services$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^insurance$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /audit defense/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /free consultation/i })).toHaveAttribute("href", "/book");
    expect(screen.getByRole("link", { name: new RegExp(`call ${PHONE.main}`, "i") })).toHaveAttribute(
      "href",
      `tel:${PHONE.mainTel}`
    );
  });

  it("renders the services loading skeleton", () => {
    render(<ServicesLoading />);

    expect(screen.getByLabelText(/loading services/i)).toBeInTheDocument();
  });

  it.each([
    [BusinessFormationPage, /start your business the right way/i, businessFormationMetadata],
    [LicensingPage, /we navigate the licensing maze so you do not have to/i, licensingMetadata],
    [InsurancePage, /business insurance that protects what you have built/i, insuranceMetadata],
    [AuditDefensePage, /audit defense and fine reduction/i, auditDefenseMetadata],
    [FinancialServicesPage, /keep your books clean, your finances clear/i, financialServicesMetadata],
    [LegalServicesPage, /legal support for immigrant entrepreneurs and families/i, legalServicesMetadata],
    [TaxServicesPage, /tax preparation and compliance for individuals and businesses/i, taxServicesMetadata],
    [ItinTaxIdPage, /itin \/ tax id services/i, itinMetadata],
  ])(
    "%s renders a service hero and FAQ section",
    async (page, heading, metadata) => {
      expect(metadata.title).toBeTruthy();

      await renderAsyncPage(page as () => Promise<React.ReactElement>);

      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
      expect(screen.getByTestId("faq-section")).toBeInTheDocument();
    }
  );

  it("renders the ITIN page FAQ block and CTA", async () => {
    await renderAsyncPage(ItinTaxIdPage);

    expect(screen.getByRole("heading", { name: /frequently asked questions/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /schedule itin appointment/i })).toHaveAttribute(
      "href",
      "/resources/forms/itin-registration-form/"
    );
  });
});
