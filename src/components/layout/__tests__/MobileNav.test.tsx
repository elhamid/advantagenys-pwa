import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

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
          const {
            whileTap, whileHover, layoutId, transition, variants,
            initial, animate, exit, originX,
            ...rest
          } = props;
          void whileTap; void whileHover; void layoutId; void transition;
          void variants; void initial; void animate; void exit; void originX;
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
  default: ({ href, children, className, onClick }: { href: string; children: React.ReactNode; className?: string; onClick?: () => void }) => (
    <a href={href} className={className} onClick={onClick}>{children}</a>
  ),
}));

import { usePathname } from "next/navigation";
import { MobileNav } from "../MobileNav";

const mockUsePathname = usePathname as ReturnType<typeof vi.fn>;

const defaultItems = [
  { label: "Services", href: "/services" },
  { label: "Industries", href: "/industries/contractors" },
  { label: "About", href: "/about" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
];

describe("MobileNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/");
  });

  // --- Closed state ---

  it("renders nothing when open=false", () => {
    const { container } = render(
      <MobileNav open={false} onClose={vi.fn()} items={defaultItems} />
    );
    // Portal content: no nav items visible
    expect(screen.queryByText("Services")).not.toBeInTheDocument();
    expect(screen.queryByText("About")).not.toBeInTheDocument();
    // The container itself may render a portal root but no panel content
    void container;
  });

  // --- Open state ---

  it("renders nav items when open=true", () => {
    render(<MobileNav open={true} onClose={vi.fn()} items={defaultItems} />);
    // "Services" appears in both the brand span (" Services") and the nav link — getAllByText
    expect(screen.getAllByText("Services").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Industries")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Resources")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("renders close button when open=true", () => {
    render(<MobileNav open={true} onClose={vi.fn()} items={defaultItems} />);
    expect(screen.getByRole("button", { name: /close menu/i })).toBeInTheDocument();
  });

  it("renders brand name when open=true", () => {
    render(<MobileNav open={true} onClose={vi.fn()} items={defaultItems} />);
    expect(screen.getByText("Advantage")).toBeInTheDocument();
  });

  it("renders booking CTA link when open=true", () => {
    render(<MobileNav open={true} onClose={vi.fn()} items={defaultItems} />);
    expect(screen.getByRole("link", { name: /book a free consultation/i })).toHaveAttribute("href", "/book");
  });

  it("renders Call and WhatsApp contact links when open=true", () => {
    render(<MobileNav open={true} onClose={vi.fn()} items={defaultItems} />);
    expect(screen.getByRole("link", { name: /call/i })).toHaveAttribute("href", expect.stringContaining("tel:"));
    expect(screen.getByRole("link", { name: /whatsapp/i })).toHaveAttribute("href", expect.stringContaining("wa.me"));
  });

  // --- Close interactions ---

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<MobileNav open={true} onClose={onClose} items={defaultItems} />);
    fireEvent.click(screen.getByRole("button", { name: /close menu/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    render(<MobileNav open={true} onClose={onClose} items={defaultItems} />);
    // The backdrop is rendered via createPortal into document.body — query from document
    const backdrop = document.querySelector(".absolute.inset-0");
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when a nav link is clicked", () => {
    const onClose = vi.fn();
    render(<MobileNav open={true} onClose={onClose} items={defaultItems} />);
    fireEvent.click(screen.getByText("About"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // --- Active state ---

  it("applies active styling to the current path link", () => {
    mockUsePathname.mockReturnValue("/about");
    render(<MobileNav open={true} onClose={vi.fn()} items={defaultItems} />);
    const aboutLink = screen.getByText("About").closest("a");
    expect(aboutLink?.className).toContain("text-[var(--blue-accent)]");
  });

  it("does not apply active styling to non-current path links", () => {
    mockUsePathname.mockReturnValue("/about");
    render(<MobileNav open={true} onClose={vi.fn()} items={defaultItems} />);
    // The nav item for /services is an <a> tag — find it by href
    const servicesLink = document.querySelector('a[href="/services"]') as HTMLElement | null;
    expect(servicesLink?.className).not.toContain("text-[var(--blue-accent)]");
  });

  it("activates Services on prefix match '/services/tax'", () => {
    mockUsePathname.mockReturnValue("/services/tax");
    render(<MobileNav open={true} onClose={vi.fn()} items={defaultItems} />);
    // Find the nav link by href since "Services" text is duplicated by the brand span
    const servicesLink = document.querySelector('a[href="/services"]') as HTMLElement | null;
    expect(servicesLink?.className).toContain("text-[var(--blue-accent)]");
  });

  // --- Body scroll lock ---

  it("locks body scroll when open=true", () => {
    render(<MobileNav open={true} onClose={vi.fn()} items={defaultItems} />);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("unlocks body scroll on unmount", () => {
    const { unmount } = render(<MobileNav open={true} onClose={vi.fn()} items={defaultItems} />);
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  // --- Custom items ---

  it("renders custom nav items correctly", () => {
    const customItems = [
      { label: "Home", href: "/" },
      { label: "Pricing", href: "/pricing" },
    ];
    render(<MobileNav open={true} onClose={vi.fn()} items={customItems} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
    // The /services nav link should NOT be present (only custom items were passed)
    // Note: brand name "Services" span is always present — check nav link specifically
    expect(document.querySelector('a[href="/services"]')).not.toBeInTheDocument();
  });
});
