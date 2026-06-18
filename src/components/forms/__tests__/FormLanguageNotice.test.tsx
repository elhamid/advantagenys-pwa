import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FormLanguageNotice } from "../FormLanguageNotice";

function setNavigatorLanguages(languages: string[]) {
  Object.defineProperty(window.navigator, "languages", {
    value: languages,
    configurable: true,
  });
  Object.defineProperty(window.navigator, "language", {
    value: languages[0] ?? "en-US",
    configurable: true,
  });
}

describe("FormLanguageNotice", () => {
  afterEach(() => {
    setNavigatorLanguages(["en-US"]);
  });

  it.each([
    { languages: ["es-US"], title: "Idioma y escritura", dir: "ltr" },
    { languages: ["fr-CA"], title: "Langue et orthographe", dir: "ltr" },
    { languages: ["hi-IN"], title: "भाषा और वर्तनी", dir: "ltr" },
    { languages: ["bn-BD"], title: "ভাষা ও বানান", dir: "ltr" },
    { languages: ["zh-CN"], title: "语言和拼写", dir: "ltr" },
    { languages: ["ar"], title: "اللغة والتهجئة", dir: "rtl" },
    { languages: ["ur-PK"], title: "زبان اور ہجے", dir: "rtl" },
  ])("shows deterministic spelling guidance for $languages", async ({ languages, title, dir }) => {
    setNavigatorLanguages(languages);

    const { container } = render(<FormLanguageNotice />);

    await waitFor(() => expect(screen.getByText(title)).toBeInTheDocument());
    expect(container.firstElementChild).toHaveAttribute("dir", dir);
  });

  it("falls back to English for unsupported browser languages", async () => {
    setNavigatorLanguages(["de-DE"]);

    render(<FormLanguageNotice />);

    await waitFor(() => expect(screen.getByText("Language and spelling")).toBeInTheDocument());
    expect(screen.getByText(/Type answers with English letters/i)).toBeInTheDocument();
  });
});
