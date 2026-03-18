import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "../Button";

describe("Button", () => {
  // --- Element type ---

  it("renders a <button> by default (no href)", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders an <a> when href is provided", () => {
    render(<Button href="/contact">Get started</Button>);
    const link = screen.getByRole("link", { name: "Get started" });
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/contact");
  });

  it("does NOT render a <button> when href is provided", () => {
    render(<Button href="/contact">Go</Button>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  // --- active:scale class ---

  it("includes active:scale-[0.97] class on button", () => {
    render(<Button>Press</Button>);
    expect(screen.getByRole("button")).toHaveClass("active:scale-[0.97]");
  });

  it("includes active:scale-[0.97] class on link variant", () => {
    render(<Button href="/">Press</Button>);
    expect(screen.getByRole("link")).toHaveClass("active:scale-[0.97]");
  });

  // --- Variant: primary (default) ---

  it("primary variant includes blue accent background", () => {
    render(<Button variant="primary">Primary</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-[var(--blue-accent)]");
    expect(btn.className).toContain("text-white");
  });

  it("defaults to primary when no variant specified", () => {
    render(<Button>Default</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-[var(--blue-accent)]");
  });

  // --- Variant: secondary ---

  it("secondary variant has surface background and border", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-[var(--surface)]");
    expect(btn.className).toContain("border");
  });

  it("secondary variant does NOT include blue accent background", () => {
    render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole("button").className).not.toContain("bg-[var(--blue-accent)]");
  });

  // --- Variant: outline ---

  it("outline variant has transparent background and blue border", () => {
    render(<Button variant="outline">Outline</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-transparent");
    expect(btn.className).toContain("border-2");
    expect(btn.className).toContain("border-[var(--blue-accent)]");
    expect(btn.className).toContain("text-[var(--blue-accent)]");
  });

  // --- Variant: ghost ---

  it("ghost variant has transparent background", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-transparent");
    expect(btn.className).toContain("text-[var(--text-secondary)]");
  });

  // --- Size: sm ---

  it("sm size applies small padding and text-sm", () => {
    render(<Button size="sm">Small</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("px-4");
    expect(btn.className).toContain("py-2");
    expect(btn.className).toContain("text-sm");
  });

  // --- Size: md (default) ---

  it("md size applies medium padding and text-base", () => {
    render(<Button size="md">Medium</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("px-6");
    expect(btn.className).toContain("py-3");
    expect(btn.className).toContain("text-base");
  });

  it("defaults to md size when no size specified", () => {
    render(<Button>Default size</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("px-6");
    expect(btn.className).toContain("py-3");
  });

  // --- Size: lg ---

  it("lg size applies large padding and text-lg", () => {
    render(<Button size="lg">Large</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("px-8");
    expect(btn.className).toContain("py-4");
    expect(btn.className).toContain("text-lg");
  });

  // --- Base classes always present ---

  it("always includes inline-flex, items-center, font-semibold, cursor-pointer", () => {
    render(<Button>Base</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("inline-flex", "items-center", "font-semibold", "cursor-pointer");
  });

  // --- className passthrough ---

  it("merges custom className with generated classes", () => {
    render(<Button className="my-custom-class">Custom</Button>);
    expect(screen.getByRole("button")).toHaveClass("my-custom-class");
  });

  // --- All variant/size matrix spot-checks ---

  it.each([
    ["primary", "sm"],
    ["primary", "md"],
    ["primary", "lg"],
    ["secondary", "sm"],
    ["secondary", "lg"],
    ["outline", "md"],
    ["ghost", "lg"],
  ] as const)("variant=%s size=%s renders without crashing", (variant, size) => {
    render(
      <Button variant={variant} size={size}>
        {variant}-{size}
      </Button>
    );
    expect(screen.getByRole("button", { name: `${variant}-${size}` })).toBeInTheDocument();
  });

  // --- HTML button props forwarded ---

  it("forwards disabled prop to underlying button", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("forwards type prop to underlying button", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
