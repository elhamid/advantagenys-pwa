import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NativeForm } from "../NativeForm";

vi.mock("next/dynamic", () => ({
  default: () => () => <div data-testid="native-form-component">Native form</div>,
}));

describe("NativeForm", () => {
  it("renders the configured native component", () => {
    render(<NativeForm componentName="ClientInfoForm" />);

    expect(screen.getByTestId("native-form-component")).toBeInTheDocument();
  });

  it("renders the fallback when the component name is unknown", () => {
    render(<NativeForm componentName="UnknownComponent" />);

    expect(screen.getByText(/form not available/i)).toBeInTheDocument();
  });
});
