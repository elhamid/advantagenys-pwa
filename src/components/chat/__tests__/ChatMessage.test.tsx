import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatMessage } from "../ChatMessage";

describe("ChatMessage", () => {
  describe("layout / alignment", () => {
    it("renders user message right-aligned", () => {
      const { container } = render(
        <ChatMessage role="user" content="Hello there" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("justify-end");
    });

    it("renders assistant message left-aligned", () => {
      const { container } = render(
        <ChatMessage role="assistant" content="Hi, how can I help?" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("justify-start");
    });

    it("user bubble has brand-color background class", () => {
      const { container } = render(
        <ChatMessage role="user" content="Brand color test" />
      );
      const bubble = container.querySelector("[class*='blue-accent']");
      expect(bubble).not.toBeNull();
    });

    it("assistant bubble uses bg variable (not brand accent)", () => {
      const { container } = render(
        <ChatMessage role="assistant" content="Assistant bubble test" />
      );
      // Should NOT contain blue-accent in the bubble, only in text color perhaps
      const userAccentBubble = container.querySelector(
        "[class*='bg-\\[var\\(--blue-accent\\)\\]']"
      );
      expect(userAccentBubble).toBeNull();
    });
  });

  describe("user message rendering", () => {
    it("renders user message text content", () => {
      render(<ChatMessage role="user" content="Hello there" />);
      expect(screen.getByText("Hello there")).toBeInTheDocument();
    });

    it("user message renders plain text without markdown parsing", () => {
      render(<ChatMessage role="user" content="**not bold** for user" />);
      // User messages use plain <p> with content, not dangerouslySetInnerHTML
      expect(screen.getByText("**not bold** for user")).toBeInTheDocument();
    });
  });

  describe("assistant markdown rendering", () => {
    it("renders bold markdown **text** as <strong>", () => {
      const { container } = render(
        <ChatMessage role="assistant" content="This is **bold** text" />
      );
      const strong = container.querySelector("strong");
      expect(strong).not.toBeNull();
      expect(strong?.textContent).toBe("bold");
    });

    it("renders italic markdown *text* as <em>", () => {
      const { container } = render(
        <ChatMessage role="assistant" content="This is *italic* text" />
      );
      const em = container.querySelector("em");
      expect(em).not.toBeNull();
      expect(em?.textContent).toBe("italic");
    });

    it("renders inline code `text` as <code>", () => {
      const { container } = render(
        <ChatMessage role="assistant" content="Use `console.log` here" />
      );
      const code = container.querySelector("code");
      expect(code).not.toBeNull();
      expect(code?.textContent).toBe("console.log");
    });

    it("renders code with correct styling classes", () => {
      const { container } = render(
        <ChatMessage role="assistant" content="`styled code`" />
      );
      const code = container.querySelector("code");
      expect(code?.className).toContain("bg-slate-100");
      expect(code?.className).toContain("font-mono");
    });

    it("renders combined markdown: bold + italic", () => {
      const { container } = render(
        <ChatMessage
          role="assistant"
          content="**bold** and *italic* together"
        />
      );
      expect(container.querySelector("strong")?.textContent).toBe("bold");
      expect(container.querySelector("em")?.textContent).toBe("italic");
    });

    it("renders newlines as <br> elements", () => {
      const { container } = render(
        <ChatMessage role="assistant" content={"line one\nline two"} />
      );
      const br = container.querySelector("br");
      expect(br).not.toBeNull();
    });

    it("renders plain assistant text without markdown artifacts", () => {
      render(<ChatMessage role="assistant" content="Plain text response" />);
      expect(screen.getByText("Plain text response")).toBeInTheDocument();
    });
  });

  describe("empty content", () => {
    it("returns null when content is empty string", () => {
      const { container } = render(
        <ChatMessage role="user" content="" />
      );
      expect(container.firstChild).toBeNull();
    });

    it("returns null when assistant content is empty", () => {
      const { container } = render(
        <ChatMessage role="assistant" content="" />
      );
      expect(container.firstChild).toBeNull();
    });
  });
});
