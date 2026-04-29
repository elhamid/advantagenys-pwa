import React from "react";
/**
 * ContactChip — unit tests
 *
 * Verifies that the three contact links are present in the header chrome with
 * correct hrefs and aria-labels. Also confirms the chip group is reachable via
 * ARIA and that the contact-info constants are used (no hardcoded strings).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ContactChip } from "../ContactChip";
import {
  CONTACT_PHONE_TEL,
  CONTACT_WHATSAPP_URL,
  CONTACT_EMAIL_HREF,
  CONTACT_PHONE_DISPLAY,
} from "@/lib/contact-info";

// Mock framer-motion — ContactChip uses useReducedMotion, AnimatePresence, and motion
vi.mock("framer-motion", () => ({
  useReducedMotion: vi.fn(() => true), // snapshot tests: reduced-motion = no animation
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("ContactChip", () => {
  it("renders a group with the accessible label 'Direct contact options'", () => {
    render(<ContactChip />);
    expect(
      screen.getByRole("group", { name: /direct contact options/i })
    ).toBeInTheDocument();
  });

  describe("WhatsApp link", () => {
    it("renders with aria-label 'Chat on WhatsApp'", () => {
      render(<ContactChip />);
      expect(screen.getByLabelText("Chat on WhatsApp")).toBeInTheDocument();
    });

    it("href matches CONTACT_WHATSAPP_URL constant", () => {
      render(<ContactChip />);
      const link = screen.getByLabelText("Chat on WhatsApp") as HTMLAnchorElement;
      expect(link.getAttribute("href")).toBe(CONTACT_WHATSAPP_URL);
    });

    it("opens in a new tab", () => {
      render(<ContactChip />);
      const link = screen.getByLabelText("Chat on WhatsApp") as HTMLAnchorElement;
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
    });
  });

  describe("Email link", () => {
    it("renders with aria-label 'Email us'", () => {
      render(<ContactChip />);
      expect(screen.getByLabelText("Email us")).toBeInTheDocument();
    });

    it("href matches CONTACT_EMAIL_HREF constant", () => {
      render(<ContactChip />);
      const link = screen.getByLabelText("Email us") as HTMLAnchorElement;
      expect(link.getAttribute("href")).toBe(CONTACT_EMAIL_HREF);
    });

    it("clicking the email chip writes the address to clipboard and shows toast", async () => {
      const writeText = vi.fn(() => Promise.resolve());
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        configurable: true,
        writable: true,
      });

      render(<ContactChip />);
      const emailLink = screen.getByLabelText("Email us");

      await act(async () => {
        fireEvent.click(emailLink);
        // flush clipboard promise micro-task
        await Promise.resolve();
      });

      expect(writeText).toHaveBeenCalledWith("info@advantagenys.com");
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByRole("status").textContent).toContain("info@advantagenys.com");
    });
  });

  describe("Phone link", () => {
    it("renders with aria-label referencing CONTACT_PHONE_DISPLAY", () => {
      render(<ContactChip />);
      // aria-label includes the display number
      expect(
        screen.getByLabelText(`Call us at ${CONTACT_PHONE_DISPLAY}`)
      ).toBeInTheDocument();
    });

    it("href is a tel: link using CONTACT_PHONE_TEL", () => {
      render(<ContactChip />);
      const link = screen.getByLabelText(
        `Call us at ${CONTACT_PHONE_DISPLAY}`
      ) as HTMLAnchorElement;
      expect(link.getAttribute("href")).toBe(`tel:${CONTACT_PHONE_TEL}`);
    });
  });

  describe("accessibility", () => {
    it("all three actions are rendered as <a> elements", () => {
      const { container } = render(<ContactChip />);
      const group = container.querySelector('[role="group"]')!;
      const links = group.querySelectorAll("a");
      expect(links).toHaveLength(3);
    });

    it("each link has a non-empty aria-label", () => {
      const { container } = render(<ContactChip />);
      const group = container.querySelector('[role="group"]')!;
      const links = Array.from(group.querySelectorAll("a"));
      links.forEach((link) => {
        const label = link.getAttribute("aria-label");
        expect(label).toBeTruthy();
        expect(label!.length).toBeGreaterThan(0);
      });
    });
  });

  describe("chip placement in ChatPanel header (integration smoke)", () => {
    it("ContactChip renders without crashing in isolation", () => {
      const { container } = render(<ContactChip />);
      expect(container.firstChild).not.toBeNull();
    });
  });
});
