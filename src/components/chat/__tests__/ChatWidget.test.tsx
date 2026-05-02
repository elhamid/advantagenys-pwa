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

// ChatPanel uses framer-motion; mock it to avoid animation complexity in unit tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useReducedMotion: () => false,
}));

// Mock useChat hook so ChatPanel renders without API calls
vi.mock("@/hooks/useChat", () => ({
  useChat: () => ({
    messages: [],
    isLoading: false,
    error: null,
    qualification: null,
    sendMessage: vi.fn(),
    clearMessages: vi.fn(),
  }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: { href: string; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { usePathname } from "next/navigation";
import { ChatWidget } from "../ChatWidget";

const mockUsePathname = usePathname as ReturnType<typeof vi.fn>;

const NUDGE_KEY = "ava-nudge-shown";

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
    // FAB label is "Chat with Ava" when closed
    const fab = screen.getByRole("button", { name: /chat with ava/i });
    expect(fab).toBeInTheDocument();
    // Panel title "Ava" should not be in the panel header (panel not open)
    expect(screen.queryByRole("button", { name: /close chat/i })).not.toBeInTheDocument();
  });

  it("opens the chat panel when FAB is clicked", () => {
    render(<ChatWidget />);
    const fab = screen.getByRole("button", { name: /chat with ava/i });
    fireEvent.click(fab);
    // Panel renders — the ChatPanel header "Ava" heading becomes visible
    // (both FAB and ChatPanel's own close button get aria-label "Close chat",
    //  so use the panel heading to confirm the panel opened)
    expect(screen.getByRole("heading", { name: /ava/i })).toBeInTheDocument();
  });

  it("closes the chat panel on close button click", () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /chat with ava/i }));
    // Panel is open; click the FAB (now "Close chat") to close — use getAllByRole
    // since ChatPanel also has a "Close chat" button
    const closeButtons = screen.getAllByRole("button", { name: /close chat/i });
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    // Click the last one (FAB is the outermost, ChatPanel close button is inside)
    fireEvent.click(closeButtons[closeButtons.length - 1]);
    expect(screen.queryByRole("heading", { name: /ava/i })).not.toBeInTheDocument();
  });

  it("toggles aria-label between 'Chat with Ava' and 'Close chat' on FAB", () => {
    render(<ChatWidget />);
    const fab = screen.getByRole("button", { name: /chat with ava/i });

    fireEvent.click(fab);
    // After opening, FAB aria-label flips to "Close chat" (panel is open)
    expect(screen.getByRole("heading", { name: /ava/i })).toBeInTheDocument();

    // Click the FAB again to close; FAB is the last "Close chat" button rendered
    const closeButtons = screen.getAllByRole("button", { name: /close chat/i });
    fireEvent.click(closeButtons[closeButtons.length - 1]);
    expect(screen.getByRole("button", { name: /chat with ava/i })).toBeInTheDocument();
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

  it("shows tax-specific nudge on /services/tax-services", () => {
    mockUsePathname.mockReturnValue("/services/tax-services");
    render(<ChatWidget />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText("Questions about tax services?")).toBeInTheDocument();
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

    expect(screen.getByText("Immigration questions?")).toBeInTheDocument();
  });

  // --- No nudge on /contact ---

  it("renders nothing on /contact (widget hidden)", () => {
    mockUsePathname.mockReturnValue("/contact");
    const { container } = render(<ChatWidget />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Widget returns null on /contact
    expect(container.firstChild).toBeNull();
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

    fireEvent.click(screen.getByRole("button", { name: /chat with ava/i }));
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

  it("widget container has fixed positioning class z-40", () => {
    const { container } = render(<ChatWidget />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("fixed", "z-50");
  });
});
