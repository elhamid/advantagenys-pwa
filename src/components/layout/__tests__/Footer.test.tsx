import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

import { Footer } from "../Footer";

describe("Footer", () => {
  it("renders without crashing", () => {
    const { container } = render(<Footer />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders as a <footer> element", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  // --- Brand ---

  it("renders brand name 'AdvantageServices'", () => {
    render(<Footer />);
    // Brand name renders as two sibling spans; use getAllBy to handle duplicate "Services" text
    expect(screen.getByText("Advantage")).toBeInTheDocument();
    // Multiple "Services" appear (brand span + h3 heading) — confirm at least one exists
    expect(screen.getAllByText("Services").length).toBeGreaterThan(0);
  });

  it("renders the 20+ years tagline", () => {
    render(<Footer />);
    expect(screen.getByText(/20\+ years/i)).toBeInTheDocument();
  });

  // --- Address ---

  it("renders street address '229-14 Linden Blvd'", () => {
    render(<Footer />);
    expect(screen.getByText(/229-14 Linden Blvd/i)).toBeInTheDocument();
  });

  it("renders city and state 'Cambria Heights, NY'", () => {
    render(<Footer />);
    // Address renders as separate text nodes — query the full address link
    const addressLink = screen.getByRole("link", { name: /229-14 Linden Blvd/i });
    expect(addressLink).toBeInTheDocument();
    expect(addressLink.textContent).toContain("Cambria Heights");
    expect(addressLink.textContent).toContain("NY");
  });

  it("address links to Google Maps", () => {
    render(<Footer />);
    const addressLink = screen.getByRole("link", { name: /229-14 Linden Blvd/i });
    expect(addressLink).toHaveAttribute("href", expect.stringContaining("maps.google.com"));
  });

  // --- Phone / Contact ---

  it("renders the main phone number", () => {
    render(<Footer />);
    expect(screen.getByText("929-933-1396")).toBeInTheDocument();
  });

  it("phone number is a tel: link", () => {
    render(<Footer />);
    const phoneLink = screen.getByRole("link", { name: "929-933-1396" });
    expect(phoneLink).toHaveAttribute("href", "tel:+19299331396");
  });

  it("renders WhatsApp SVG icon alongside the phone number", () => {
    // Footer shows phone + WhatsApp SVG icons next to the tel: link (no separate WhatsApp anchor)
    const { container } = render(<Footer />);
    // The WhatsApp SVG is rendered with a distinctive emerald class
    expect(container.querySelector("svg.text-emerald-400")).not.toBeNull();
  });

  // --- Hours ---

  it("renders business hours Monday through Saturday", () => {
    render(<Footer />);
    expect(screen.getByText(/monday/i)).toBeInTheDocument();
    expect(screen.getByText(/saturday/i)).toBeInTheDocument();
  });

  it("renders time '10:00 AM - 7:00 PM ET'", () => {
    render(<Footer />);
    expect(screen.getByText(/10:00 AM/i)).toBeInTheDocument();
    expect(screen.getByText(/7:00 PM/i)).toBeInTheDocument();
  });

  // --- Services section ---

  it("renders a Services section header h3", () => {
    render(<Footer />);
    // The footer has an h3 "Services" and a brand span "Services" — query the h3 specifically
    const servicesHeading = screen.getAllByText(/^services$/i).find(
      (el) => el.tagName === "H3"
    );
    expect(servicesHeading).toBeDefined();
  });

  it("renders links for all 7 services", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Business Formation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tax Services" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Immigration & Legal Services" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Insurance" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Audit Defense" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Financial Services" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Licensing" })).toBeInTheDocument();
  });

  // --- Industries section ---

  it("renders a Industries section header", () => {
    render(<Footer />);
    expect(screen.getByText(/^industries$/i)).toBeInTheDocument();
  });

  it("renders industry segment links", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Contractors" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Restaurants" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Immigrant Entrepreneurs" })).toBeInTheDocument();
  });

  // --- Company links ---

  it("renders About Us link", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "About Us" })).toHaveAttribute("href", "/about");
  });

  it("renders Contact link", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
  });

  it("renders Resources link", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Resources" })).toHaveAttribute("href", "/resources");
  });

  // --- Legal / copyright ---

  it("renders copyright notice with current year", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
    expect(screen.getByText(/Advantage Services/i)).toBeInTheDocument();
  });

  it("renders Privacy link", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
  });

  it("renders Terms link", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
  });
});
