import { render, screen, act, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCountUp } from "../useCountUp";

let observerCallback: IntersectionObserverCallback | null = null;
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback;
  }

  observe = mockObserve;
  unobserve = mockUnobserve;
  disconnect = mockDisconnect;
}

function CountUpHarness({
  target,
  duration,
  startOnView,
}: {
  target: number;
  duration: number;
  startOnView: boolean;
}) {
  const { ref, count } = useCountUp(target, duration, startOnView);

  return (
    <div>
      <div ref={ref} data-testid="countup-target" />
      <span data-testid="countup-value">{count}</span>
    </div>
  );
}

describe("useCountUp", () => {
  beforeEach(() => {
    observerCallback = null;
    mockObserve.mockClear();
    mockUnobserve.mockClear();
    mockDisconnect.mockClear();
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: FrameRequestCallback) => {
        callback(1000);
        return 1;
      })
    );
    vi.spyOn(performance, "now").mockReturnValue(0);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("animates immediately when startOnView is false", async () => {
    render(<CountUpHarness target={12} duration={1000} startOnView={false} />);

    await waitFor(() => expect(screen.getByTestId("countup-value")).toHaveTextContent("12"));
  });

  it("starts counting after the element intersects when startOnView is true", async () => {
    render(<CountUpHarness target={7} duration={1000} startOnView={true} />);

    await waitFor(() => expect(mockObserve).toHaveBeenCalledTimes(1));

    act(() => {
      observerCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    await waitFor(() => expect(screen.getByTestId("countup-value")).toHaveTextContent("7"));
    expect(mockUnobserve).toHaveBeenCalledTimes(1);
    expect(mockDisconnect).not.toHaveBeenCalled();
  });
});
