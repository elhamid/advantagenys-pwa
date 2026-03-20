import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import Page from "../page";

vi.mock("next/image", () => ({
  default: ({ src, alt, fill: _fill, ...rest }: { src: string; alt: string; fill?: boolean; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...rest} />
  ),
}));

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        const Component = React.forwardRef<HTMLElement, React.PropsWithChildren<Record<string, unknown>>>(
          ({ children, ...props }, ref) =>
            React.createElement(tag, { ...props, ref }, children as React.ReactNode)
        );
        Component.displayName = `motion.${tag}`;
        return Component;
      },
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useInView: () => true,
  useMotionValue: () => ({ set: vi.fn(), get: () => 0 }),
  useScroll: () => ({ scrollYProgress: {} }),
  useSpring: (value: unknown) => value,
  useTransform: () => 0,
  animate: () => ({ stop: vi.fn() }),
}));

beforeAll(() => {
  class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    constructor(_callback: IntersectionObserverCallback) {}
  }

  Object.defineProperty(window, "IntersectionObserver", { writable: true, value: MockIntersectionObserver });
  Object.defineProperty(window, "requestAnimationFrame", {
    writable: true,
    value: (callback: FrameRequestCallback) => {
      callback(performance.now());
      return 1;
    },
  });
  Object.defineProperty(window, "cancelAnimationFrame", { writable: true, value: () => {} });
});

describe("Demo3Page", () => {
  it("renders the hero copy", () => {
    render(<Page />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(/business solutions that actually work/i);
    expect(
      screen.getByText(/formation\. licensing\. tax\. insurance\. audit defense\. one firm, no runaround\./i)
    ).toBeInTheDocument();
  });
});
