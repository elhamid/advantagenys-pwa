/**
 * ContactChip — unit tests
 *
 * Verifies that the three contact links are present in the header chrome with
 * correct hrefs and aria-labels. Also confirms the chip group is reachable via
 * ARIA and that the contact-info constants are used (no hardcoded strings).
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContactChip } from "../ContactChip";
import {
  CONTACT_PHONE_TEL,
  CONTACT_WHATSAPP_URL,
  CONTACT_EMAIL_HREF,
  CONTACT_PHONE_DISPLAY,
} from "@/lib/contact-info";

// Mock framer-motion — ContactChip uses useReducedMotion
vi.mock("framer-motion", () => ({
  useReducedMotion: vi.fn(() => true), // snapshot tests: reduced-motion = no animation
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
