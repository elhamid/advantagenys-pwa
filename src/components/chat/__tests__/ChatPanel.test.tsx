import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatPanel } from "../ChatPanel";

// ---------------------------------------------------------------------------
// Mock useChat hook
// ---------------------------------------------------------------------------

const mockSendMessage = vi.fn();
const mockClearMessages = vi.fn();

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatQualification = {
  score: number;
  level: "hot" | "qualified" | "warm" | "cold";
  shouldHandoff: boolean;
  detectedService?: string;
};

type ChatState = {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  qualification: ChatQualification | null;
  sendMessage: typeof mockSendMessage;
  clearMessages: typeof mockClearMessages;
};

const defaultChatState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  qualification: null,
  sendMessage: mockSendMessage,
  clearMessages: mockClearMessages,
};

vi.mock("@/hooks/useChat", () => ({
  useChat: vi.fn(() => defaultChatState),
}));

// Mock framer-motion to avoid animation complexity in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  // ContactChip uses useReducedMotion — return true so no animation styles are injected
  useReducedMotion: vi.fn(() => true),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <a href={href} onClick={onClick} {...rest}>
      {children}
    </a>
  ),
}));

// ---------------------------------------------------------------------------
// Re-import after mocks are set up
// ---------------------------------------------------------------------------

import { useChat } from "@/hooks/useChat";

function setChat(overrides: Partial<ChatState>) {
  vi.mocked(useChat).mockReturnValue({ ...defaultChatState, ...overrides });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ChatPanel", () => {
  const defaultProps = {
    pageContext: "/",
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setChat({});
  });

  describe("header", () => {
    it('renders "Ava" as the chat title', () => {
      render(<ChatPanel {...defaultProps} />);
      // Use heading role to differentiate from "Ava" mention in the empty-state greeting
      expect(screen.getByRole("heading", { name: /ava/i })).toBeInTheDocument();
    });

    it('renders "Your AI assistant" subtitle', () => {
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByText("Your AI assistant")).toBeInTheDocument();
    });

    it("renders close button with accessible label", () => {
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByLabelText("Close chat")).toBeInTheDocument();
    });

    it("calls onClose when close button is clicked", async () => {
      const onClose = vi.fn();
      render(<ChatPanel {...defaultProps} onClose={onClose} />);
      await userEvent.click(screen.getByLabelText("Close chat"));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it("does not show clear button when messages are empty", () => {
      setChat({ messages: [] });
      render(<ChatPanel {...defaultProps} />);
      expect(screen.queryByLabelText("Clear chat")).toBeNull();
    });

    it("shows clear button when messages exist", () => {
      setChat({
        messages: [
          { id: "1", role: "user", content: "Hello" },
          { id: "2", role: "assistant", content: "Hi there!" },
        ],
      });
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByLabelText("Clear chat")).toBeInTheDocument();
    });

    it("calls clearMessages when clear button is clicked", async () => {
      setChat({
        messages: [{ id: "1", role: "user", content: "Hello" }],
      });
      render(<ChatPanel {...defaultProps} />);
      await userEvent.click(screen.getByLabelText("Clear chat"));
      expect(mockClearMessages).toHaveBeenCalledOnce();
    });
  });

  describe("empty state", () => {
    it("shows empty-state greeting when no messages", () => {
      setChat({ messages: [] });
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByText(/I'm/)).toBeInTheDocument();
    });
  });

  describe("messages list", () => {
    it("renders messages in the message list", () => {
      setChat({
        messages: [
          { id: "1", role: "user", content: "Tell me about tax services" },
          { id: "2", role: "assistant", content: "We offer full tax prep!" },
        ],
      });
      render(<ChatPanel {...defaultProps} />);
      expect(
        screen.getByText("Tell me about tax services")
      ).toBeInTheDocument();
      expect(screen.getByText("We offer full tax prep!")).toBeInTheDocument();
    });
  });

  describe("input field", () => {
    it("renders text input with correct placeholder", () => {
      render(<ChatPanel {...defaultProps} />);
      expect(
        screen.getByPlaceholderText("Type your message...")
      ).toBeInTheDocument();
    });

    it("accepts text input", async () => {
      render(<ChatPanel {...defaultProps} />);
      const input = screen.getByPlaceholderText(
        "Type your message..."
      ) as HTMLInputElement;
      await userEvent.type(input, "Hello!");
      expect(input.value).toBe("Hello!");
    });

    it("send button is disabled when input is empty", () => {
      render(<ChatPanel {...defaultProps} />);
      const sendBtn = screen.getByLabelText("Send message");
      expect(sendBtn).toBeDisabled();
    });

    it("send button is enabled after typing text", async () => {
      render(<ChatPanel {...defaultProps} />);
      const input = screen.getByPlaceholderText("Type your message...");
      const sendBtn = screen.getByLabelText("Send message");
      await userEvent.type(input, "test message");
      expect(sendBtn).not.toBeDisabled();
    });

    it("send button is disabled when input is only whitespace", async () => {
      render(<ChatPanel {...defaultProps} />);
      const input = screen.getByPlaceholderText("Type your message...");
      const sendBtn = screen.getByLabelText("Send message");
      await userEvent.type(input, "   ");
      expect(sendBtn).toBeDisabled();
    });

    it("send button is disabled while loading", () => {
      setChat({ isLoading: true });
      render(<ChatPanel {...defaultProps} />);
      // Input should also be disabled
      const input = screen.getByPlaceholderText(
        "Type your message..."
      ) as HTMLInputElement;
      expect(input).toBeDisabled();
    });
  });

  describe("form submission", () => {
    it("calls sendMessage with trimmed input on submit", async () => {
      render(<ChatPanel {...defaultProps} />);
      const input = screen.getByPlaceholderText("Type your message...");
      await userEvent.type(input, "  My question  ");
      await userEvent.click(screen.getByLabelText("Send message"));
      expect(mockSendMessage).toHaveBeenCalledWith("My question");
    });

    it("clears input after sending", async () => {
      render(<ChatPanel {...defaultProps} />);
      const input = screen.getByPlaceholderText(
        "Type your message..."
      ) as HTMLInputElement;
      await userEvent.type(input, "Hello");
      await userEvent.click(screen.getByLabelText("Send message"));
      expect(input.value).toBe("");
    });

    it("sends message on Enter key press", async () => {
      render(<ChatPanel {...defaultProps} />);
      const input = screen.getByPlaceholderText("Type your message...");
      await userEvent.type(input, "Enter submit{Enter}");
      expect(mockSendMessage).toHaveBeenCalledWith("Enter submit");
    });

    it("does not call sendMessage when input is empty on submit", async () => {
      const { container } = render(<ChatPanel {...defaultProps} />);
      const form = container.querySelector("form")!;
      expect(form).not.toBeNull();
      fireEvent.submit(form);
      expect(mockSendMessage).not.toHaveBeenCalled();
    });
  });

  describe("loading indicator (TypingIndicator)", () => {
    it("shows typing indicator when loading and last assistant message is empty", () => {
      setChat({
        isLoading: true,
        messages: [
          { id: "1", role: "user", content: "Hello" },
          { id: "2", role: "assistant", content: "" },
        ],
      });
      const { container } = render(<ChatPanel {...defaultProps} />);
      // TypingIndicator renders 3 animated dots
      const dots = container.querySelectorAll(".animate-bounce");
      expect(dots).toHaveLength(3);
    });

    it("does not show typing indicator when last assistant message has content", () => {
      setChat({
        isLoading: true,
        messages: [
          { id: "1", role: "user", content: "Hello" },
          { id: "2", role: "assistant", content: "Partial response" },
        ],
      });
      const { container } = render(<ChatPanel {...defaultProps} />);
      const dots = container.querySelectorAll(".animate-bounce");
      expect(dots).toHaveLength(0);
    });

    it("does not show typing indicator when not loading", () => {
      setChat({
        isLoading: false,
        messages: [
          { id: "1", role: "user", content: "Hello" },
          { id: "2", role: "assistant", content: "" },
        ],
      });
      const { container } = render(<ChatPanel {...defaultProps} />);
      const dots = container.querySelectorAll(".animate-bounce");
      expect(dots).toHaveLength(0);
    });
  });

  describe("qualification CTA card", () => {
    it("shows CTA card when qualification level is hot", () => {
      setChat({
        qualification: {
          score: 65,
          level: "hot",
          shouldHandoff: false,
          detectedService: "tax",
        },
      });
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByText("Ready to get started?")).toBeInTheDocument();
      expect(screen.getByText("Book Consultation")).toBeInTheDocument();
    });

    it("shows CTA card when qualification level is qualified", () => {
      setChat({
        qualification: {
          score: 80,
          level: "qualified",
          shouldHandoff: true,
          detectedService: "formation",
        },
      });
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByText("Ready to get started?")).toBeInTheDocument();
    });

    it("does not show CTA card when qualification is null", () => {
      setChat({ qualification: null });
      render(<ChatPanel {...defaultProps} />);
      expect(screen.queryByText("Ready to get started?")).toBeNull();
    });

    it("does not show CTA card when qualification level is warm", () => {
      setChat({
        qualification: {
          score: 35,
          level: "warm",
          shouldHandoff: false,
        },
      });
      render(<ChatPanel {...defaultProps} />);
      expect(screen.queryByText("Ready to get started?")).toBeNull();
    });

    it("does not show CTA card when qualification level is cold", () => {
      setChat({
        qualification: {
          score: 10,
          level: "cold",
          shouldHandoff: false,
        },
      });
      render(<ChatPanel {...defaultProps} />);
      expect(screen.queryByText("Ready to get started?")).toBeNull();
    });

    it("CTA card has link to /contact", () => {
      setChat({
        qualification: {
          score: 65,
          level: "hot",
          shouldHandoff: false,
        },
      });
      render(<ChatPanel {...defaultProps} />);
      const link = screen.getByText("Book Consultation").closest("a");
      expect(link?.getAttribute("href")).toBe("/book");
    });

    it("CTA card has call phone link", () => {
      setChat({
        qualification: {
          score: 65,
          level: "hot",
          shouldHandoff: false,
        },
      });
      render(<ChatPanel {...defaultProps} />);
      const callLink = screen.getByText(/Call \(929\) 933-1396/);
      expect(callLink.closest("a")?.getAttribute("href")).toBe(
        "tel:+19299331396"
      );
    });

    it("clicking Book Consultation calls onClose", async () => {
      const onClose = vi.fn();
      setChat({
        qualification: {
          score: 65,
          level: "hot",
          shouldHandoff: false,
        },
      });
      render(<ChatPanel {...defaultProps} onClose={onClose} />);
      await userEvent.click(screen.getByText("Book Consultation"));
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe("contact chip (header chrome)", () => {
    it("renders the contact chip group inside the header chrome", () => {
      render(<ChatPanel {...defaultProps} />);
      // ContactChip renders a group with this label — must be present at all times
      expect(
        screen.getByRole("group", { name: /direct contact options/i })
      ).toBeInTheDocument();
    });

    it("WhatsApp link is present and has correct aria-label", () => {
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByLabelText("Chat on WhatsApp")).toBeInTheDocument();
    });

    it("Email link is present and has correct aria-label", () => {
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByLabelText("Email us")).toBeInTheDocument();
    });

    it("Phone link is present and has correct aria-label", () => {
      render(<ChatPanel {...defaultProps} />);
      // aria-label includes the display number
      expect(screen.getByLabelText(/call us at/i)).toBeInTheDocument();
    });

    it("WhatsApp link href points to wa.me", () => {
      render(<ChatPanel {...defaultProps} />);
      const link = screen.getByLabelText("Chat on WhatsApp") as HTMLAnchorElement;
      expect(link.getAttribute("href")).toMatch(/wa\.me/);
    });

    it("Email link href is a mailto: link", () => {
      render(<ChatPanel {...defaultProps} />);
      const link = screen.getByLabelText("Email us") as HTMLAnchorElement;
      expect(link.getAttribute("href")).toMatch(/^mailto:/);
    });

    it("Phone link href is a tel: link", () => {
      render(<ChatPanel {...defaultProps} />);
      const link = screen.getByLabelText(/call us at/i) as HTMLAnchorElement;
      expect(link.getAttribute("href")).toMatch(/^tel:/);
    });

    it("contact chip is visible regardless of message count (anchored in chrome)", () => {
      // Empty state
      setChat({ messages: [] });
      const { unmount } = render(<ChatPanel {...defaultProps} />);
      expect(screen.getByRole("group", { name: /direct contact options/i })).toBeInTheDocument();
      unmount();

      // With messages
      setChat({
        messages: [
          { id: "1", role: "user", content: "Hello" },
          { id: "2", role: "assistant", content: "Hi!" },
        ],
      });
      render(<ChatPanel {...defaultProps} />);
      expect(screen.getByRole("group", { name: /direct contact options/i })).toBeInTheDocument();
    });
  });

  describe("error banner", () => {
    it("displays error message when error is set", () => {
      setChat({ error: "Failed to connect. Please try again." });
      render(<ChatPanel {...defaultProps} />);
      expect(
        screen.getByText("Failed to connect. Please try again.")
      ).toBeInTheDocument();
    });

    it("does not display error banner when error is null", () => {
      setChat({ error: null });
      render(<ChatPanel {...defaultProps} />);
      // No red banner text
      expect(screen.queryByText(/failed/i)).toBeNull();
    });

    it("error banner has red styling", () => {
      setChat({ error: "Something went wrong" });
      const { container } = render(<ChatPanel {...defaultProps} />);
      const banner = container.querySelector(".bg-red-50");
      expect(banner).not.toBeNull();
    });
  });
});
