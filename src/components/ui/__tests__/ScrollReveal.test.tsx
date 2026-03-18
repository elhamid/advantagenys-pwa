import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ScrollReveal } from "../ScrollReveal";

// IntersectionObserver is not available in jsdom — we need to mock it.
// This mock lets us manually trigger intersection callbacks.
let observerCallback: IntersectionObserverCallback | null = null;
let observedElement: Element | null = null;

const mockDisconnect = vi.fn();
const mockUnobserve = vi.fn();
const mockObserve = vi.fn((el: Element) => {
  observedElement = el;
});

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback;
  }
  observe = mockObserve;
  unobserve = mockUnobserve;
  disconnect = mockDisconnect;
}

beforeEach(() => {
  observerCallback = null;
  observedElement = null;
  mockDisconnect.mockClear();
  mockUnobserve.mockClear();
  mockObserve.mockClear();
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ScrollReveal", () => {
  it("renders children", () => {
    render(<ScrollReveal>Visible content</ScrollReveal>);
    expect(screen.getByText("Visible content")).toBeInTheDocument();
  });

  it("starts with opacity 0 and translateY(24px) before intersection", () => {
    const { container } = render(<ScrollReveal>Content</ScrollReveal>);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.opacity).toBe("0");
    expect(wrapper.style.transform).toContain("translateY(24px)");
  });

  it("becomes visible (opacity 1, translateY 0) after intersection", () => {
    const { container } = render(<ScrollReveal>Content</ScrollReveal>);
    const wrapper = container.firstChild as HTMLElement;

    act(() => {
      observerCallback?.(
        [{ isIntersecting: true, target: observedElement! } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(wrapper.style.opacity).toBe("1");
    expect(wrapper.style.transform).toContain("translateY(0)");
  });

  it("does not become visible when isIntersecting is false", () => {
    const { container } = render(<ScrollReveal>Content</ScrollReveal>);
    const wrapper = container.firstChild as HTMLElement;

    act(() => {
      observerCallback?.(
        [{ isIntersecting: false, target: observedElement! } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    // Should still be hidden
    expect(wrapper.style.opacity).toBe("0");
  });

  it("calls unobserve after becoming visible (observe-once behavior)", () => {
    render(<ScrollReveal>Content</ScrollReveal>);

    act(() => {
      observerCallback?.(
        [{ isIntersecting: true, target: observedElement! } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(mockUnobserve).toHaveBeenCalledTimes(1);
    expect(mockUnobserve).toHaveBeenCalledWith(observedElement);
  });

  it("calls disconnect on unmount (cleanup)", () => {
    const { unmount } = render(<ScrollReveal>Content</ScrollReveal>);
    unmount();
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  // --- className passthrough ---

  it("applies custom className to the wrapper div", () => {
    const { container } = render(<ScrollReveal className="my-reveal">Content</ScrollReveal>);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("my-reveal");
  });

  it("renders without className when none is provided", () => {
    const { container } = render(<ScrollReveal>Content</ScrollReveal>);
    const wrapper = container.firstChild as HTMLElement;
    // No extra class name beyond the empty default
    expect(wrapper.className).toBe("");
  });

  // --- delay prop is applied in transition ---

  it("includes the delay value in the transition style string", () => {
    const { container } = render(<ScrollReveal delay={300}>Delayed</ScrollReveal>);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.transition).toContain("300ms");
  });

  it("uses delay=0 as the default", () => {
    const { container } = render(<ScrollReveal>No delay</ScrollReveal>);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.transition).toContain("0ms");
  });
});
