import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock constants so tests aren't coupled to real phone numbers
vi.mock("@/lib/constants", () => ({
  PHONE: {
    main: "929-933-1396",
    mainTel: "+19299331396",
    whatsapp: "929-933-1396",
    whatsappLink: "https://wa.me/19299331396",
  },
}));

import { usePathname } from "next/navigation";
import { ChatWidget } from "../ChatWidget";

const mockUsePathname = usePathname as ReturnType<typeof vi.fn>;

const NUDGE_KEY = "chat-nudge-shown";

describe("ChatWidget", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    mockUsePathname.mockReturnValue("/");
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  // --- Open / close ---

  it("renders the FAB button initially closed", () => {
    render(<ChatWidget />);
    const fab = screen.getByRole("button", { name: /open chat/i });
    expect(fab).toBeInTheDocument();
    // Panel should not be present
    expect(screen.queryByText("Get in Touch")).not.toBeInTheDocument();
  });

  it("opens the chat panel when FAB is clicked", () => {
    render(<ChatWidget />);
    const fab = screen.getByRole("button", { name: /open chat/i });
    fireEvent.click(fab);
    expect(screen.getByText("Get in Touch")).toBeInTheDocument();
  });

  it("closes the chat panel on second FAB click", () => {
    render(<ChatWidget />);
    const fab = screen.getByRole("button", { name: /open chat/i });

    fireEvent.click(fab);
    expect(screen.getByText("Get in Touch")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close chat/i }));
    expect(screen.queryByText("Get in Touch")).not.toBeInTheDocument();
  });

  it("toggles aria-label between 'Open chat' and 'Close chat'", () => {
    render(<ChatWidget />);
    const fab = screen.getByRole("button", { name: /open chat/i });

    fireEvent.click(fab);
    expect(screen.getByRole("button", { name: /close chat/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close chat/i }));
    expect(screen.getByRole("button", { name: /open chat/i })).toBeInTheDocument();
  });

  // --- Contact links when open ---

  it("shows WhatsApp link when open", () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open chat/i }));

    const whatsappLink = screen.getByRole("link", { name: /whatsapp/i });
    expect(whatsappLink).toHaveAttribute("href", "https://wa.me/19299331396");
    expect(whatsappLink).toHaveAttribute("target", "_blank");
  });

  it("shows call link when open", () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open chat/i }));

    const callLink = screen.getByRole("link", { name: /call/i });
    expect(callLink).toHaveAttribute("href", "tel:+19299331396");
  });

  // --- Nudge: generic path ---

  it("shows 'Need help?' nudge after 3s on a generic path", () => {
    mockUsePathname.mockReturnValue("/about");
    render(<ChatWidget />);

    expect(screen.queryByText("Need help?")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText("Need help?")).toBeInTheDocument();
  });

  it("nudge disappears after 5s (auto-dismiss)", () => {
    mockUsePathname.mockReturnValue("/about");
    render(<ChatWidget />);

    act(() => {
      vi.advanceTimersByTime(3000); // nudge appears
    });
    expect(screen.getByText("Need help?")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000); // auto-dismiss fires
    });
    expect(screen.queryByText("Need help?")).not.toBeInTheDocument();
  });

  // --- Nudge: page-aware messages ---

  it("shows tax-specific nudge on /services/tax", () => {
    mockUsePathname.mockReturnValue("/services/tax");
    render(<ChatWidget />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText("Tax question?")).toBeInTheDocument();
  });

  it("shows business formation nudge on /services/business-formation", () => {
    mockUsePathname.mockReturnValue("/services/business-formation");
    render(<ChatWidget />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText("Starting a business?")).toBeInTheDocument();
  });

  it("shows immigration nudge on /services/legal", () => {
    mockUsePathname.mockReturnValue("/services/legal");
    render(<ChatWidget />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText("Immigration help?")).toBeInTheDocument();
  });

  // --- No nudge on /contact ---

  it("shows no nudge on /contact even after 3s", () => {
    mockUsePathname.mockReturnValue("/contact");
    render(<ChatWidget />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // getNudge returns null for /contact
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  // --- SessionStorage prevents repeat nudge ---

  it("does not show nudge if sessionStorage key already set", () => {
    sessionStorage.setItem(NUDGE_KEY, "1");
    mockUsePathname.mockReturnValue("/about");
    render(<ChatWidget />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText("Need help?")).not.toBeInTheDocument();
  });

  it("sets sessionStorage key after nudge is shown", () => {
    mockUsePathname.mockReturnValue("/about");
    render(<ChatWidget />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(sessionStorage.getItem(NUDGE_KEY)).toBe("1");
  });

  // --- Clicking FAB dismisses nudge ---

  it("dismisses nudge when FAB is clicked", () => {
    mockUsePathname.mockReturnValue("/about");
    render(<ChatWidget />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText("Need help?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open chat/i }));
    expect(screen.queryByText("Need help?")).not.toBeInTheDocument();
  });

  // --- Nudge role for accessibility ---

  it("nudge element has role='status' and aria-live='polite'", () => {
    mockUsePathname.mockReturnValue("/about");
    render(<ChatWidget />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    const nudgeContainer = screen.getByRole("status");
    expect(nudgeContainer).toHaveAttribute("aria-live", "polite");
  });

  // --- Widget position ---

  it("widget container has fixed positioning with correct classes", () => {
    const { container } = render(<ChatWidget />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("fixed", "z-40", "chat-widget");
  });
});
