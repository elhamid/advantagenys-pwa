import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Component = ({ children, ...props }: any) => {
          const { whileTap, whileHover, layoutId, transition, variants, initial, animate, exit, ...rest } = props;
          void whileTap; void whileHover; void layoutId; void transition; void variants; void initial; void animate; void exit;
          return React.createElement(tag, rest, children);
        };
        Component.displayName = `motion.${tag}`;
        return Component;
      },
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn() }),
  useInView: () => true,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

import { Header } from "../Header";

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the Advantage Services brand name", () => {
    render(<Header />);
    expect(screen.getByText("Advantage")).toBeInTheDocument();
    // "Services" appears as both a brand span and a nav link — use getAllByText
    expect(screen.getAllByText("Services").length).toBeGreaterThanOrEqual(2);
  });

  it("brand name links to the homepage", () => {
    render(<Header />);
    const homeLink = screen.getAllByRole("link").find((link) => link.getAttribute("href") === "/");
    expect(homeLink).toBeDefined();
  });

  it("renders desktop navigation links", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "Industries" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Resources" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();
  });

  it("renders at least one 'Get Started' CTA link", () => {
    render(<Header />);
    const getStartedLinks = screen.getAllByRole("link", { name: "Get Started" });
    expect(getStartedLinks.length).toBeGreaterThan(0);
    // All Get Started links point to /contact
    getStartedLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/contact");
    });
  });

  it("renders as a <header> element", () => {
    render(<Header />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("has sticky and z-50 classes on the header", () => {
    render(<Header />);
    const header = screen.getByRole("banner");
    expect(header.className).toContain("sticky");
    expect(header.className).toContain("z-50");
  });

  it("starts with translateY(0) inline style (visible)", () => {
    render(<Header />);
    const header = screen.getByRole("banner");
    expect(header.style.transform).toBe("translateY(0)");
  });

  it("hides header (translateY(-100%)) when scrolled down past 80px", () => {
    render(<Header />);
    const header = screen.getByRole("banner");

    act(() => {
      // Simulate a first scroll to 90px (to initialize lastScrollY)
      Object.defineProperty(window, "scrollY", { value: 90, writable: true, configurable: true });
      window.dispatchEvent(new Event("scroll"));
    });

    act(() => {
      // Simulate scrolling further down
      Object.defineProperty(window, "scrollY", { value: 200, writable: true, configurable: true });
      window.dispatchEvent(new Event("scroll"));
    });

    expect(header.style.transform).toBe("translateY(-100%)");
  });

  it("shows header (translateY(0)) when scrolled above 80px", () => {
    render(<Header />);
    const header = screen.getByRole("banner");

    // First scroll down
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 90, writable: true, configurable: true });
      window.dispatchEvent(new Event("scroll"));
    });
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 200, writable: true, configurable: true });
      window.dispatchEvent(new Event("scroll"));
    });

    // Now scroll up past the 80px threshold
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 50, writable: true, configurable: true });
      window.dispatchEvent(new Event("scroll"));
    });

    expect(header.style.transform).toBe("translateY(0)");
  });

  // --- MobileNav integration ---

  it("renders MobileNav as closed by default (no close button visible)", () => {
    render(<Header />);
    expect(screen.queryByRole("button", { name: /close menu/i })).not.toBeInTheDocument();
  });

  it("renders MobileNav as open when mobileNavOpen=true", () => {
    render(<Header mobileNavOpen={true} onMobileNavClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: /close menu/i })).toBeInTheDocument();
  });
});
