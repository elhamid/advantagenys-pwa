import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FormEmbed } from "../FormEmbed";

describe("FormEmbed", () => {
  afterEach(() => {
    window.history.replaceState({}, "", "/");
  });

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

  it("passes AdvantageOS share attribution into embedded JotForm URLs", () => {
    window.history.replaceState(
      {},
      "",
      "/resources/forms/itin-registration-form?shared_by=staff-123&utm_source=advantageos&utm_medium=staff_share&utm_campaign=form_share&ignored=value"
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

    expect(screen.getByTitle("ITIN Registration Form")).toHaveAttribute(
      "src",
      "https://form.jotform.com/210224697492156?shared_by=staff-123&utm_source=advantageos&utm_medium=staff_share&utm_campaign=form_share"
    );
  });
});
