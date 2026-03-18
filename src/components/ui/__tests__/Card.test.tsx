import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Card } from "../Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("renders as a <div> element", () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  // --- Base classes always present ---

  it("always includes rounded, bg-surface, padding, shadow, border classes", () => {
    const { container } = render(<Card>Base</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("rounded-[var(--radius-lg)]");
    expect(card.className).toContain("bg-[var(--surface)]");
    expect(card.className).toContain("p-6");
    expect(card.className).toContain("border");
  });

  // --- hover prop ---

  it("does not add hover classes when hover=false (default)", () => {
    const { container } = render(<Card>No hover</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).not.toContain("hover:shadow-[var(--shadow-md)]");
    expect(card.className).not.toContain("hover:-translate-y-1");
  });

  it("adds hover classes when hover=true", () => {
    const { container } = render(<Card hover>Hoverable</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("hover:-translate-y-1");
    expect(card.className).toContain("active:scale-[0.97]");
  });

  it("adds transition classes when hover=true", () => {
    const { container } = render(<Card hover>Hoverable</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("transition-all");
  });

  // --- className passthrough ---

  it("merges custom className", () => {
    const { container } = render(<Card className="my-card-class">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("my-card-class");
  });

  it("custom className coexists with base classes", () => {
    const { container } = render(<Card className="custom">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("custom");
    expect(card.className).toContain("p-6");
  });

  // --- Can hold complex children ---

  it("renders nested HTML children", () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Paragraph</p>
      </Card>
    );
    expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
    expect(screen.getByText("Paragraph")).toBeInTheDocument();
  });
});
