import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FormPageShareBar } from "../FormPageShareBar";

vi.mock("@/components/resources/ShareButton", () => ({
  ShareButton: ({
    title,
    url,
    variant,
  }: {
    title: string;
    url: string;
    variant: string;
  }) => <button type="button">{`${variant}:${title}:${url}`}</button>,
}));

describe("FormPageShareBar", () => {
  it("renders all share variants for the form URL", () => {
    render(<FormPageShareBar title="Native Intake" slug="native-intake" />);

    expect(screen.getByRole("button", { name: /full:native intake:\/resources\/forms\/native-intake/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /whatsapp:native intake:\/resources\/forms\/native-intake/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copy:native intake:\/resources\/forms\/native-intake/i })).toBeInTheDocument();
  });
});
