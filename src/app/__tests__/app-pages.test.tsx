import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PHONE, ADDRESS, HOURS } from "@/lib/constants";
import HomePage from "../page";
import ContactPage, { metadata as contactMetadata } from "../contact/page";
import PrivacyPage, { metadata as privacyMetadata } from "../privacy/page";
import TermsPage, { metadata as termsMetadata } from "../terms/page";
import Loading from "../loading";
import Template from "../template";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

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

vi.mock("@/components/contact/ContactFormTabs", () => ({
  ContactFormTabs: () => <div>ContactFormTabs</div>,
}));

vi.mock("@/components/ui/PageSkeleton", () => ({
  PageSkeleton: () => <div>PageSkeleton</div>,
}));

vi.mock("@/components/home/HeroSection", () => ({ HeroSection: () => <section>HeroSection</section> }));
vi.mock("@/components/home/QuickPathsSection", () => ({ QuickPathsSection: () => <section>QuickPathsSection</section> }));
vi.mock("@/components/home/StatsSection", () => ({ StatsSection: () => <section>StatsSection</section> }));
vi.mock("@/components/home/ReviewsSection", () => ({ ReviewsSection: () => <section>ReviewsSection</section> }));
vi.mock("@/components/home/PersonaCarousel", () => ({ PersonaCarousel: () => <section>PersonaCarousel</section> }));
vi.mock("@/components/home/TeamSection", () => ({ TeamSection: () => <section>TeamSection</section> }));
vi.mock("@/components/home/JourneyTimeline", () => ({ JourneyTimeline: () => <section>JourneyTimeline</section> }));
vi.mock("@/components/home/FinalCTA", () => ({ FinalCTA: () => <section>FinalCTA</section> }));

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        const Component = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
          React.createElement(tag, props, children);
        Component.displayName = `motion.${tag}`;
        return Component;
      },
    }
  ),
}));

describe("App pages", () => {
  it("renders the home page sections", () => {
    render(<HomePage />);

    expect(screen.getByText("HeroSection")).toBeInTheDocument();
    expect(screen.getByText("QuickPathsSection")).toBeInTheDocument();
    expect(screen.getByText("StatsSection")).toBeInTheDocument();
    expect(screen.getByText("ReviewsSection")).toBeInTheDocument();
    expect(screen.getByText("PersonaCarousel")).toBeInTheDocument();
    expect(screen.getByText("TeamSection")).toBeInTheDocument();
    expect(screen.getByText("JourneyTimeline")).toBeInTheDocument();
    expect(screen.getByText("FinalCTA")).toBeInTheDocument();
  });

  it("exports contact metadata and renders the contact page", () => {
    expect(contactMetadata.title).toBe("Contact");
    expect(contactMetadata.description).toMatch(/free consultation/i);

    render(<ContactPage />);

    expect(screen.getByRole("heading", { name: /contact us/i })).toBeInTheDocument();
    expect(screen.getByText("ContactFormTabs")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: PHONE.main })).toHaveAttribute("href", `tel:${PHONE.mainTel}`);
    expect(screen.getByRole("link", { name: /whatsapp/i })).toHaveAttribute("href", PHONE.whatsappLink);
    expect(screen.getByText(new RegExp(`${ADDRESS.street}, ${ADDRESS.city}`, "i"))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(HOURS.days.replace("Monday - Saturday", "Mon–Sat"), "i"))).toBeInTheDocument();
  });

  it("exports privacy metadata and renders the privacy page", () => {
    expect(privacyMetadata.title).toBe("Privacy Policy");
    expect(privacyMetadata.description).toMatch(/personal and business information/i);

    render(<PrivacyPage />);

    expect(screen.getByRole("heading", { name: /privacy policy/i })).toBeInTheDocument();
    expect(screen.getByText(/We do not sell your personal information/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /JotForm's Privacy Policy/i })).toHaveAttribute(
      "href",
      "https://www.jotform.com/privacy/"
    );
  });

  it("exports terms metadata and renders the terms page", () => {
    expect(termsMetadata.title).toBe("Terms of Service");
    expect(termsMetadata.description).toMatch(/business consulting services/i);

    render(<TermsPage />);

    expect(screen.getByRole("heading", { name: /terms of service/i })).toBeInTheDocument();
    expect(screen.getByText(/Last updated: March 2026/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /advantagenys\.com/i })[0]).toHaveAttribute(
      "href",
      "https://advantagenys.com"
    );
  });

  it("renders the app loading skeleton", () => {
    render(<Loading />);

    expect(screen.getByText("PageSkeleton")).toBeInTheDocument();
  });

  it("renders the app template wrapper", () => {
    render(
      <Template>
        <span>Template child</span>
      </Template>
    );

    expect(screen.getByText("Template child")).toBeInTheDocument();
  });
});
