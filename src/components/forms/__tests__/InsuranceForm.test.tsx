import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InsuranceForm } from "../InsuranceForm";

vi.mock("@/components/ui/Button", () => ({
  Button: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/ui/Card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

function mockFetchResponse(ok: boolean, body: object) {
  return vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: async () => body,
  });
}

describe("InsuranceForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders the intake fields and checkbox options", () => {
    render(<InsuranceForm />);

    expect(screen.getByText(/insurance intake form/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/business name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/annual revenue/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/general liability/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit insurance request/i })).toBeInTheDocument();
  });

  it("submits the insurance payload and shows the success state", async () => {
    const fetchSpy = mockFetchResponse(true, { success: true });
    vi.stubGlobal("fetch", fetchSpy);

    const user = userEvent.setup();
    render(<InsuranceForm />);

    await user.type(screen.getByLabelText(/full name/i), "Morgan Policy");
    await user.type(screen.getByLabelText(/phone number/i), "9295550104");
    await user.type(screen.getByLabelText(/^email/i), "morgan@example.com");
    await user.type(screen.getByLabelText(/business name/i), "Morgan LLC");
    await user.selectOptions(screen.getByLabelText(/business type/i), "LLC");
    await user.click(screen.getByLabelText(/general liability/i));
    await user.click(screen.getByLabelText(/workers' compensation/i));
    await user.click(screen.getByRole("button", { name: /submit insurance request/i }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledOnce());

    const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/contact");
    expect(JSON.parse(options.body as string)).toMatchObject({
      fullName: "Morgan Policy",
      phone: "9295550104",
      email: "morgan@example.com",
      businessName: "Morgan LLC",
      businessType: "LLC",
      insuranceTypesNeeded: ["General Liability", "Workers' Compensation"],
      type: "insurance",
      source: "website-insurance",
    });

    expect(await screen.findByText(/thank you, morgan policy/i)).toBeInTheDocument();
  });

  it("shows an error message when the API returns a failure", async () => {
    vi.stubGlobal("fetch", mockFetchResponse(false, { success: false, error: "Server error" }));

    const user = userEvent.setup();
    render(<InsuranceForm />);

    await user.type(screen.getByLabelText(/full name/i), "Morgan Policy");
    await user.type(screen.getByLabelText(/phone number/i), "9295550104");
    await user.type(screen.getByLabelText(/^email/i), "morgan@example.com");
    await user.type(screen.getByLabelText(/business name/i), "Morgan LLC");
    await user.click(screen.getByRole("button", { name: /submit insurance request/i }));

    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
  });
});
