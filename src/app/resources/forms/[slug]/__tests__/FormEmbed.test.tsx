import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FormEmbed } from "../FormEmbed";

const originalLocation = window.location.href;
let mockInAppBrowser = false;

vi.mock("@/hooks/useInAppBrowser", () => ({
  useInAppBrowser: () => mockInAppBrowser,
  safeBlankTarget: () => "_blank",
}));

afterEach(() => {
  mockInAppBrowser = false;
  window.history.pushState({}, "", originalLocation);
});

describe("FormEmbed", () => {
  it("renders an iframe for non-JotForm embeds without loading the helper script", () => {
    render(
      <FormEmbed
        form={{
          title: "Typeform Intake",
          platform: "typeform",
          embedUrl: "https://example.com/form",
        } as never}
      />
    );

    expect(screen.getByTitle("Typeform Intake")).toHaveAttribute("src", "https://example.com/form");
    expect(document.body.querySelector('script[src="https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js"]')).toBeNull();
  });

  it("loads the JotForm helper and wires the iframe selector", async () => {
    const handler = vi.fn();
    Object.defineProperty(window, "jotformEmbedHandler", {
      configurable: true,
      writable: true,
      value: handler,
    });

    const { unmount } = render(
      <FormEmbed
        form={{
          id: "abc123",
          title: "JotForm Intake",
          platform: "jotform",
          embedUrl: "https://form.jotform.com/abc123",
        } as never}
      />
    );

    const script = document.body.querySelector(
      'script[src="https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js"]'
    ) as HTMLScriptElement | null;

    expect(script).toBeInTheDocument();
    script?.onload?.(new Event("load"));

    await waitFor(() => {
      expect(handler).toHaveBeenCalledWith('iframe[id="JotFormIFrame-abc123"]', "https://form.jotform.com/");
    });

    unmount();
    expect(document.body.querySelector('script[src="https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js"]')).toBeNull();
  });

  it("passes staff attribution and campaign params into the full-browser fallback link", async () => {
    mockInAppBrowser = true;
    window.history.pushState(
      {},
      "",
      "/resources/forms/itin-registration-form?shared_by=staff-123&send_id=send-abc&utm_source=advantageos&utm_medium=staff_share&utm_campaign=form_share"
    );

    render(
      <FormEmbed
        form={{
          id: "210224697492156",
          title: "ITIN Registration Form",
          platform: "jotform",
          embedUrl: "https://form.jotform.com/210224697492156",
        } as never}
      />
    );

    await waitFor(() => {
      const href = screen.getByRole("link", { name: /open form in full browser/i }).getAttribute("href");
      expect(href).toContain("shared_by=staff-123");
      expect(href).toContain("send_id=send-abc");
      expect(href).toContain("utm_source=advantageos");
      expect(href).toContain("utm_medium=staff_share");
      expect(href).toContain("utm_campaign=form_share");
      expect(new URL(href || "").searchParams.getAll("shared_by")).toEqual(["staff-123"]);
    });
  });

  it("passes staff attribution and send id into the JotForm iframe URL", () => {
    window.history.pushState(
      {},
      "",
      "/resources/forms/itin-registration-form?shared_by=staff-123&send_id=send-abc"
    );

    render(
      <FormEmbed
        form={{
          id: "210224697492156",
          title: "ITIN Registration Form",
          platform: "jotform",
          embedUrl: "https://form.jotform.com/210224697492156",
        } as never}
      />
    );

    const iframe = screen.getByTitle("ITIN Registration Form");
    const url = new URL(iframe.getAttribute("src") || "");
    expect(url.searchParams.get("shared_by")).toBe("staff-123");
    expect(url.searchParams.get("send_id")).toBe("send-abc");
  });
});
