import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Loading from "../loading";

vi.mock("@/components/ui/PageSkeleton", () => ({
  PageSkeleton: () => <div>PageSkeleton</div>,
}));

describe("App loading", () => {
  it("renders the page skeleton", () => {
    render(<Loading />);

    expect(screen.getByText("PageSkeleton")).toBeInTheDocument();
  });
});
