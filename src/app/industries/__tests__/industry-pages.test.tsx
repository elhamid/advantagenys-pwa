import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ContractorsPage, { metadata as contractorsMetadata } from "../contractors/page";
import ImmigrantEntrepreneursPage, { metadata as immigrantMetadata } from "../immigrant-entrepreneurs/page";
import RestaurantsPage, { metadata as restaurantsMetadata } from "../restaurants/page";

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
  JsonLd: () => null,
}));

describe("Industry pages", () => {
  it("renders the contractors page", () => {
    expect(contractorsMetadata.title).toMatch(/Contractor Business Services/i);

    render(<ContractorsPage />);

    expect(screen.getByRole("heading", { name: /we handle the licensing maze/i })).toBeInTheDocument();
    expect(screen.getByText(/what keeps contractors up at night/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /get licensed today/i })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: /get licensed today/i })[0]).toHaveAttribute("href", "/contact");
  });

  it("renders the immigrant entrepreneurs page", () => {
    expect(immigrantMetadata.title).toMatch(/Immigrant Entrepreneur Services/i);

    render(<ImmigrantEntrepreneursPage />);

    expect(screen.getByRole("heading", { level: 1, name: /^2,250\+ itins processed$/i })).toBeInTheDocument();
    expect(screen.getByText(/We understand your challenges/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /get your itin/i })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: /get your itin/i })[0]).toHaveAttribute("href", "/contact");
  });

  it("renders the restaurants page", () => {
    expect(restaurantsMetadata.title).toMatch(/Restaurant Business Services/i);

    render(<RestaurantsPage />);

    expect(screen.getByRole("heading", { name: /all permits\. one partner\./i })).toBeInTheDocument();
    expect(screen.getByText(/what keeps restaurant owners up at night/i)).toBeInTheDocument();
    const restaurantCtas = screen.getAllByRole("link", { name: /start your restaurant/i });
    expect(restaurantCtas).toHaveLength(2);
    expect(restaurantCtas[0]).toHaveAttribute("href", "/contact");
  });
});
