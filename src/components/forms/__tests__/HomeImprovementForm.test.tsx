import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomeImprovementForm } from "../HomeImprovementForm";

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

describe("HomeImprovementForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders the intake fields and shows the license number field when needed", async () => {
    const user = userEvent.setup();
    render(<HomeImprovementForm />);

    expect(screen.getByText(/home improvement licensing application/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/license type/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit application/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/license number/i)).not.toBeInTheDocument();

    await user.click(screen.getByLabelText(/^yes$/i));
    expect(screen.getByLabelText(/license number/i)).toBeInTheDocument();
  });

  it("submits the home-improvement payload and shows the success state", async () => {
    const fetchSpy = mockFetchResponse(true, { success: true });
    vi.stubGlobal("fetch", fetchSpy);

    const user = userEvent.setup();
    render(<HomeImprovementForm />);

    await user.type(screen.getByLabelText(/full name/i), "Jamie Contractor");
    await user.type(screen.getByLabelText(/phone number/i), "9295550103");
    await user.type(screen.getByLabelText(/^email/i), "jamie@example.com");
    await user.selectOptions(screen.getByLabelText(/license type/i), "General Contractor");
    await user.click(screen.getByLabelText(/^yes$/i));
    await user.type(screen.getByLabelText(/license number/i), "LIC-12345");
    await user.click(screen.getByRole("button", { name: /submit application/i }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledOnce());

    const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/contact");
    expect(JSON.parse(options.body as string)).toMatchObject({
      fullName: "Jamie Contractor",
      phone: "9295550103",
      email: "jamie@example.com",
      licenseType: "General Contractor",
      hasExistingLicense: "yes",
      licenseNumber: "LIC-12345",
      type: "home-improvement",
      source: "website-home-improvement",
    });

    expect(await screen.findByText(/thank you, jamie contractor/i)).toBeInTheDocument();
  });

  it("shows an error message when the API returns a failure", async () => {
    vi.stubGlobal("fetch", mockFetchResponse(false, { success: false, error: "Server error" }));

    const user = userEvent.setup();
    render(<HomeImprovementForm />);

    await user.type(screen.getByLabelText(/full name/i), "Jamie Contractor");
    await user.type(screen.getByLabelText(/phone number/i), "9295550103");
    await user.type(screen.getByLabelText(/^email/i), "jamie@example.com");
    await user.selectOptions(screen.getByLabelText(/license type/i), "General Contractor");
    await user.click(screen.getByRole("button", { name: /submit application/i }));

    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
  });
});
