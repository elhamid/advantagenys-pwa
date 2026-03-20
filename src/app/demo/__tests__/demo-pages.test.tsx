import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { PHONE } from "@/lib/constants";
import Demo1 from "../1/page";
import Demo2 from "../2/page";
import Demo3 from "../3/page";
import Demo4 from "../4/page";
import Demo5 from "../5/page";

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

  const stripMotionProps = (props: Record<string, unknown>) =>
    Object.fromEntries(Object.entries(props).filter(([key]) => !MOTION_PROP_KEYS.has(key)));

  return {
    motion: new Proxy(
      {},
      {
        get: (_target, tag: string) => {
          const Component = React.forwardRef<HTMLElement, React.PropsWithChildren<Record<string, unknown>>>(
            ({ children, ...props }, ref) =>
              React.createElement(tag, { ...stripMotionProps(props), ref }, children as React.ReactNode)
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

  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: MockIntersectionObserver,
  });

  Object.defineProperty(window, "requestAnimationFrame", {
    writable: true,
    value: (callback: FrameRequestCallback) => {
      callback(performance.now());
      return 1;
    },
  });

  Object.defineProperty(window, "cancelAnimationFrame", {
    writable: true,
    value: () => {},
  });
});

function normalizedHeadingText() {
  const heading = screen.getByRole("heading", { level: 1 });
  return heading.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

describe("Demo pages", () => {
  it("renders demo 1", () => {
    render(<Demo1 />);

    expect(normalizedHeadingText()).toMatch(/Your Business\. ?Our Expertise\./i);
    expect(screen.getByText(/Est\. 2004/i)).toBeInTheDocument();
  });

  it("renders demo 2", () => {
    render(<Demo2 />);

    expect(normalizedHeadingText()).toContain("One Firm. Every Solution.");
    expect(screen.getByText(/Business consulting for NYC's entrepreneurs/i)).toBeInTheDocument();
  });

  it("renders demo 3", () => {
    render(<Demo3 />);

    expect(normalizedHeadingText()).toContain("Business Solutions That Actually Work");
    expect(screen.getByText(/Formation\. Licensing\. Tax\. Insurance\. Audit Defense\. One firm, no runaround\./i)).toBeInTheDocument();
  });

  it("renders demo 4", () => {
    render(<Demo4 />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Your Business Deserves[\s\S]*Real Partner/i);
    expect(screen.getByText(/A Real Partner/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /talk to a specialist/i })).toHaveAttribute(
      "href",
      `tel:${PHONE.mainTel}`
    );
  });

  it("renders demo 5", () => {
    render(<Demo5 />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/We handle the business[\s\S]*of your business\./i);
    expect(screen.getByText(/So you can handle everything else\./i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /talk to someone real/i })).toHaveAttribute(
      "href",
      `tel:${PHONE.mainTel}`
    );
    expect(screen.getByRole("link", { name: /see how we help/i })).toHaveAttribute("href", "#personas");
  });
});
