import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Container } from "../Container";

describe("Container", () => {
  it("renders children", () => {
    render(<Container>Container content</Container>);
    expect(screen.getByText("Container content")).toBeInTheDocument();
  });

  it("renders as a <div> by default", () => {
    const { container } = render(<Container>Content</Container>);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  // --- Base layout classes always present ---

  it("always includes mx-auto, w-full, max-w-7xl, and responsive px classes", () => {
    const { container } = render(<Container>Content</Container>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("mx-auto");
    expect(el.className).toContain("w-full");
    expect(el.className).toContain("max-w-7xl");
    expect(el.className).toContain("px-4");
    expect(el.className).toContain("sm:px-6");
    expect(el.className).toContain("lg:px-8");
  });

  // --- as prop: polymorphic rendering ---

  it("renders as <section> when as='section'", () => {
    const { container } = render(<Container as="section">Content</Container>);
    expect(container.firstChild?.nodeName).toBe("SECTION");
  });

  it("renders as <main> when as='main'", () => {
    const { container } = render(<Container as="main">Content</Container>);
    expect(container.firstChild?.nodeName).toBe("MAIN");
  });

  it("renders as <article> when as='article'", () => {
    const { container } = render(<Container as="article">Content</Container>);
    expect(container.firstChild?.nodeName).toBe("ARTICLE");
  });

  it("renders as <nav> when as='nav'", () => {
    const { container } = render(<Container as="nav">Content</Container>);
    expect(container.firstChild?.nodeName).toBe("NAV");
  });

  // --- className passthrough ---

  it("merges custom className with base classes", () => {
    const { container } = render(<Container className="custom-class">Content</Container>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("custom-class");
    expect(el.className).toContain("max-w-7xl");
  });

  // --- Works with nested children ---

  it("renders multiple children correctly", () => {
    render(
      <Container>
        <span>First</span>
        <span>Second</span>
      </Container>
    );
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  // --- Polymorphic + className combined ---

  it("as='section' with className applies both correctly", () => {
    const { container } = render(
      <Container as="section" className="hero-section">
        Content
      </Container>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.nodeName).toBe("SECTION");
    expect(el.className).toContain("hero-section");
    expect(el.className).toContain("max-w-7xl");
  });
});
