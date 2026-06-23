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

  it("does not render or load a visible JotForm iframe", () => {
    render(
      <FormEmbed
        form={{
          id: "abc123",
          title: "JotForm Intake",
          platform: "jotform",
          embedUrl: "https://form.jotform.com/abc123",
        } as never}
      />
    );

    expect(screen.getByText(/legacy form is no longer embedded/i)).toBeInTheDocument();
    expect(screen.queryByTitle("JotForm Intake")).not.toBeInTheDocument();
    expect(document.body.querySelector('iframe[src*="jotform"]')).toBeNull();
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
        form={{ title: "Typeform Intake", platform: "typeform", embedUrl: "https://example.com/form" } as never}
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

  it("passes staff attribution and send id into non-JotForm iframe URLs", () => {
    window.history.pushState(
      {},
      "",
      "/resources/forms/itin-registration-form?shared_by=staff-123&send_id=send-abc"
    );

    render(
      <FormEmbed
        form={{
          title: "Typeform Intake",
          platform: "typeform",
          embedUrl: "https://example.com/form",
        } as never}
      />
    );

    const iframe = screen.getByTitle("Typeform Intake");
    const url = new URL(iframe.getAttribute("src") || "");
    expect(url.searchParams.get("shared_by")).toBe("staff-123");
    expect(url.searchParams.get("send_id")).toBe("send-abc");
  });
});
