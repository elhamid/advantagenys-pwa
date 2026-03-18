import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Must be hoisted before any import that uses the mocked module
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
          // Strip framer-only props so React doesn't warn
          const { whileTap, layoutId, transition, ...rest } = props;
          void whileTap; void layoutId; void transition;
          // Use React.createElement with the actual tag string so <motion.button> → <button>
          return React.createElement(tag, rest, children);
        };
        Component.displayName = `motion.${tag}`;
        return Component;
      },
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimation: () => ({ start: vi.fn() }),
  useInView: () => true,
}));

// next/link renders a plain <a> in test env
vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

import { usePathname } from "next/navigation";
import { BottomNav } from "../BottomNav";

const mockUsePathname = usePathname as ReturnType<typeof vi.fn>;

describe("BottomNav", () => {
  const onOpenMore = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/");
  });

  it("renders 4 navigation links plus a More button (5 items total)", () => {
    render(<BottomNav onOpenMore={onOpenMore} />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(screen.getByText("Forms")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
  });

  it("renders correct hrefs for each nav link", () => {
    render(<BottomNav onOpenMore={onOpenMore} />);

    expect(screen.getByText("Home").closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByText("Services").closest("a")).toHaveAttribute("href", "/services");
    expect(screen.getByText("Forms").closest("a")).toHaveAttribute("href", "/resources");
    expect(screen.getByText("Contact").closest("a")).toHaveAttribute("href", "/contact");
  });

  it("applies active color to Home on exact '/' match", () => {
    mockUsePathname.mockReturnValue("/");
    render(<BottomNav onOpenMore={onOpenMore} />);

    // Home label span should have the active color style
    const homeLabel = screen.getByText("Home");
    expect(homeLabel).toHaveStyle({ color: "var(--blue-accent)" });

    // Other labels should have the inactive color
    const servicesLabel = screen.getByText("Services");
    expect(servicesLabel).toHaveStyle({ color: "#94a3b8" });
  });

  it("does NOT activate Home on '/services' (exact match)", () => {
    mockUsePathname.mockReturnValue("/services");
    render(<BottomNav onOpenMore={onOpenMore} />);

    const homeLabel = screen.getByText("Home");
    expect(homeLabel).toHaveStyle({ color: "#94a3b8" });
  });

  it("activates Services on '/services' (non-exact prefix)", () => {
    mockUsePathname.mockReturnValue("/services");
    render(<BottomNav onOpenMore={onOpenMore} />);

    const servicesLabel = screen.getByText("Services");
    expect(servicesLabel).toHaveStyle({ color: "var(--blue-accent)" });
  });

  it("activates Services on prefix match '/services/tax'", () => {
    mockUsePathname.mockReturnValue("/services/tax");
    render(<BottomNav onOpenMore={onOpenMore} />);

    const servicesLabel = screen.getByText("Services");
    expect(servicesLabel).toHaveStyle({ color: "var(--blue-accent)" });

    const homeLabel = screen.getByText("Home");
    expect(homeLabel).toHaveStyle({ color: "#94a3b8" });
  });

  it("activates Forms on prefix match '/resources/forms/itin-registration-form'", () => {
    mockUsePathname.mockReturnValue("/resources/forms/itin-registration-form");
    render(<BottomNav onOpenMore={onOpenMore} />);

    const formsLabel = screen.getByText("Forms");
    expect(formsLabel).toHaveStyle({ color: "var(--blue-accent)" });
  });

  it("activates Contact on '/contact'", () => {
    mockUsePathname.mockReturnValue("/contact");
    render(<BottomNav onOpenMore={onOpenMore} />);

    const contactLabel = screen.getByText("Contact");
    expect(contactLabel).toHaveStyle({ color: "var(--blue-accent)" });
  });

  it("calls onOpenMore when More button is clicked", () => {
    render(<BottomNav onOpenMore={onOpenMore} />);

    const moreButton = screen.getByRole("button", { name: /open menu/i });
    fireEvent.click(moreButton);

    expect(onOpenMore).toHaveBeenCalledTimes(1);
  });

  it("More button has correct aria-label", () => {
    render(<BottomNav onOpenMore={onOpenMore} />);
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });

  it("nav is hidden on md+ screens via md:hidden class", () => {
    render(<BottomNav onOpenMore={onOpenMore} />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("md:hidden");
  });

  it("nav is fixed and positioned at bottom", () => {
    render(<BottomNav onOpenMore={onOpenMore} />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("fixed", "bottom-0");
  });
});
