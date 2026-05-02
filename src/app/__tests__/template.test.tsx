import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Template from "../template";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        const Component = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
          React.createElement(tag, props, children);
        Component.displayName = `motion.${tag}`;
        return Component;
      },
    }
  ),
}));

describe("Template", () => {
  it("passes children through the motion wrapper", () => {
    render(
      <Template>
        <span>Template child</span>
      </Template>
    );

    expect(screen.getByText("Template child")).toBeInTheDocument();
  });
});
