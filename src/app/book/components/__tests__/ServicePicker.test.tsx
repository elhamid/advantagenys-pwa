import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect } from "vitest";
import { ServicePicker, SERVICES } from "../ServicePicker";

// Mock framer-motion to render plain divs — avoids animation complexity in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...filterDomProps(props)}>{children}</div>
    ),
    button: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <button {...filterDomProps(props)}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Strip non-DOM props that framer-motion would normally consume
function filterDomProps(props: Record<string, unknown>) {
  const filtered: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(props)) {
    if (
      !["initial", "animate", "exit", "transition", "variants", "whileHover", "whileTap", "layout"].includes(key)
    ) {
      filtered[key] = val;
    }
  }
  return filtered;
}

describe("ServicePicker", () => {
  it("renders all 6 service options", () => {
    render(<ServicePicker selected={null} onSelect={vi.fn()} />);

    for (const svc of SERVICES) {
      expect(screen.getByText(svc.label)).toBeInTheDocument();
      expect(screen.getByText(svc.description)).toBeInTheDocument();
    }
  });

  it("renders the correct number of service buttons", () => {
    render(<ServicePicker selected={null} onSelect={vi.fn()} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(6);
  });

  it("calls onSelect with the correct slug when a service is clicked", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<ServicePicker selected={null} onSelect={onSelect} />);

    await user.click(screen.getByText("Tax Services"));
    expect(onSelect).toHaveBeenCalledWith("tax");

    await user.click(screen.getByText("ITIN / Tax ID"));
    expect(onSelect).toHaveBeenCalledWith("itin");

    await user.click(screen.getByText("Business Formation"));
    expect(onSelect).toHaveBeenCalledWith("formation");
  });

  it("shows selected state (aria-pressed) for the currently selected service", () => {
    render(<ServicePicker selected="insurance" onSelect={vi.fn()} />);

    const insuranceBtn = screen.getByText("Insurance").closest("button");
    expect(insuranceBtn).toHaveAttribute("aria-pressed", "true");

    // Other buttons should not be selected
    const taxBtn = screen.getByText("Tax Services").closest("button");
    expect(taxBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("shows no selected state when selected is null", () => {
    render(<ServicePicker selected={null} onSelect={vi.fn()} />);
    const buttons = screen.getAllByRole("button");
    for (const btn of buttons) {
      expect(btn).toHaveAttribute("aria-pressed", "false");
    }
  });

  it("each service has the expected slugs", () => {
    const slugs = SERVICES.map((s) => s.slug);
    expect(slugs).toEqual([
      "tax",
      "itin",
      "formation",
      "insurance",
      "audit",
      "consulting",
    ]);
  });
});
