import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ToolsPage from "../page";

// next/link renders a plain <a> in the jsdom test environment
describe("ToolsPage", () => {
  it("renders the page heading", () => {
    render(<ToolsPage />);
    expect(screen.getByRole("heading", { name: /free business tools/i })).toBeInTheDocument();
  });

  it("renders all 3 tool cards", () => {
    render(<ToolsPage />);
    expect(screen.getByRole("heading", { name: /tax savings estimator/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /business readiness checker/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /itin eligibility checker/i })).toBeInTheDocument();
  });

  it("links to the tax savings estimator tool page", () => {
    render(<ToolsPage />);
    const links = screen.getAllByRole("link");
    const taxLink = links.find((l) => l.getAttribute("href") === "/tools/tax-savings-estimator");
    expect(taxLink).toBeDefined();
  });

  it("links to the business readiness checker tool page", () => {
    render(<ToolsPage />);
    const links = screen.getAllByRole("link");
    const brcLink = links.find((l) => l.getAttribute("href") === "/tools/business-readiness-checker");
    expect(brcLink).toBeDefined();
  });

  it("links to the ITIN eligibility checker tool page", () => {
    render(<ToolsPage />);
    const links = screen.getAllByRole("link");
    const itinLink = links.find((l) => l.getAttribute("href") === "/tools/itin-eligibility-checker");
    expect(itinLink).toBeDefined();
  });

  it("shows the tax savings estimator description", () => {
    render(<ToolsPage />);
    expect(
      screen.getByText(/find out how much you could save with the right business structure/i)
    ).toBeInTheDocument();
  });

  it("shows the business readiness checker description", () => {
    render(<ToolsPage />);
    expect(
      screen.getByText(/5-question assessment/i)
    ).toBeInTheDocument();
  });

  it("shows the ITIN eligibility checker description", () => {
    render(<ToolsPage />);
    expect(
      screen.getByText(/check if you qualify for an individual taxpayer identification number/i)
    ).toBeInTheDocument();
  });

  it("shows the Most Popular badge on tax savings estimator", () => {
    render(<ToolsPage />);
    expect(screen.getByText("Most Popular")).toBeInTheDocument();
  });

  it("shows the IRS Certified badge on ITIN eligibility checker", () => {
    render(<ToolsPage />);
    expect(screen.getByText("IRS Certified")).toBeInTheDocument();
  });

  it("shows Start free call-to-action text on each card", () => {
    render(<ToolsPage />);
    // Three cards, each has "Start free →"
    const startLinks = screen.getAllByText(/start free/i);
    expect(startLinks).toHaveLength(3);
  });
});
