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

vi.mock("framer-motion", () => {
  const MOTION_PROP_KEYS = new Set([
    "animate",
    "initial",
    "exit",
    "transition",
    "whileHover",
    "whileTap",
    "whileInView",
    "viewport",
    "layout",
    "layoutId",
    "drag",
    "dragConstraints",
    "dragElastic",
    "dragMomentum",
    "dragTransition",
    "dragControls",
    "dragListener",
    "onViewportEnter",
    "onViewportLeave",
    "priority",
    "global",
    "jsx",
  ]);

  const stripMotionProps = (props: Record<string, unknown>): Record<string, unknown> =>
    Object.fromEntries(Object.entries(props).filter(([key]) => !MOTION_PROP_KEYS.has(key)));

  return {
    motion: new Proxy(
      {},
      {
        get: (_target, tag: string) => {
          const Tag = tag as unknown as React.ElementType;
          const Component = React.forwardRef<HTMLElement, React.PropsWithChildren<Record<string, unknown>>>(
            ({ children, ...props }, ref) =>
              React.createElement(
                Tag,
                {
                  ...(stripMotionProps(props) as React.HTMLAttributes<HTMLElement>),
                  ref: ref as React.Ref<HTMLElement>,
                },
                children as React.ReactNode
              )
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
  };
});

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

describe("Demo2Page", () => {
  it("renders the hero copy", () => {
    render(<Page />);

    const heading = screen.getByRole("heading", { level: 1 }).textContent
      ?.replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    expect(heading).toContain("One Firm. Every Solution.");
    expect(screen.getByText(/business consulting for nyc's entrepreneurs/i)).toBeInTheDocument();
  });
});
