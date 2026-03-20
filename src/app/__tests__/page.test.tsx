import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "../page";

vi.mock("@/components/home/HeroSection", () => ({ HeroSection: () => <section>HeroSection</section> }));
vi.mock("@/components/home/QuickPathsSection", () => ({ QuickPathsSection: () => <section>QuickPathsSection</section> }));
vi.mock("@/components/home/StatsSection", () => ({ StatsSection: () => <section>StatsSection</section> }));
vi.mock("@/components/home/ReviewsSection", () => ({ ReviewsSection: () => <section>ReviewsSection</section> }));
vi.mock("@/components/home/PersonaCarousel", () => ({ PersonaCarousel: () => <section>PersonaCarousel</section> }));
vi.mock("@/components/home/TeamSection", () => ({ TeamSection: () => <section>TeamSection</section> }));
vi.mock("@/components/home/JourneyTimeline", () => ({ JourneyTimeline: () => <section>JourneyTimeline</section> }));
vi.mock("@/components/home/FinalCTA", () => ({ FinalCTA: () => <section>FinalCTA</section> }));

describe("HomePage", () => {
  it("renders the homepage section stack", () => {
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
});
