import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "../Badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders as a <span> element", () => {
    render(<Badge>Label</Badge>);
    expect(screen.getByText("Label").tagName).toBe("SPAN");
  });

  // --- Default variant ---

  it("default variant includes blue-pale background and blue-accent text", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge.className).toContain("bg-[var(--blue-pale)]");
    expect(badge.className).toContain("text-[var(--blue-accent)]");
  });

  it("applies default variant when no variant prop is given", () => {
    render(<Badge>Implicit default</Badge>);
    const badge = screen.getByText("Implicit default");
    expect(badge.className).toContain("bg-[var(--blue-pale)]");
  });

  // --- Success variant ---

  it("success variant includes green background and green text", () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText("Success");
    expect(badge.className).toContain("bg-green-50");
    expect(badge.className).toContain("text-[var(--green)]");
  });

  // --- Warning variant ---

  it("warning variant includes amber background and amber text", () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText("Warning");
    expect(badge.className).toContain("bg-amber-50");
    expect(badge.className).toContain("text-[var(--amber)]");
  });

  // --- Error variant ---

  it("error variant includes red background and red text", () => {
    render(<Badge variant="error">Error</Badge>);
    const badge = screen.getByText("Error");
    expect(badge.className).toContain("bg-red-50");
    expect(badge.className).toContain("text-[var(--red)]");
  });

  // --- Base classes always present ---

  it("always includes inline-flex, items-center, rounded-full, font-semibold", () => {
    render(<Badge>Base</Badge>);
    const badge = screen.getByText("Base");
    expect(badge).toHaveClass("inline-flex", "items-center", "rounded-full", "font-semibold");
  });

  it("always includes px-3 py-1 text-xs", () => {
    render(<Badge>Sizing</Badge>);
    const badge = screen.getByText("Sizing");
    expect(badge).toHaveClass("px-3", "py-1", "text-xs");
  });

  // --- className passthrough ---

  it("merges custom className with generated classes", () => {
    render(<Badge className="my-custom">Custom</Badge>);
    expect(screen.getByText("Custom")).toHaveClass("my-custom");
  });

  // --- All variant spot-checks ---

  it.each([
    ["default"],
    ["success"],
    ["warning"],
    ["error"],
  ] as const)("variant=%s renders without crashing", (variant) => {
    render(<Badge variant={variant}>{variant}</Badge>);
    expect(screen.getByText(variant)).toBeInTheDocument();
  });
});
