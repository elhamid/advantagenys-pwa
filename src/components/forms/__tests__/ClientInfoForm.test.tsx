import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClientInfoForm } from "../ClientInfoForm";

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

describe("ClientInfoForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders the core fields and submit button", () => {
    render(<ClientInfoForm />);

    expect(screen.getByText(/client information/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full legal name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/service interested in/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit information/i })).toBeInTheDocument();
  });

  it("submits the client-info payload and shows the thank-you state", async () => {
    const fetchSpy = mockFetchResponse(true, { success: true });
    vi.stubGlobal("fetch", fetchSpy);

    const user = userEvent.setup();
    render(<ClientInfoForm />);

    await user.type(screen.getByLabelText(/full legal name/i), "Jane Client");
    await user.type(screen.getByLabelText(/phone number/i), "9295550101");
    await user.type(screen.getByLabelText(/^email/i), "jane@example.com");
    await user.selectOptions(screen.getByLabelText(/service interested in/i), "Tax Services");
    await user.selectOptions(screen.getByLabelText(/how did you hear about us/i), "Google");
    await user.click(screen.getByRole("button", { name: /submit information/i }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledOnce());

    const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/contact");
    expect(JSON.parse(options.body as string)).toMatchObject({
      fullName: "Jane Client",
      phone: "9295550101",
      email: "jane@example.com",
      serviceInterested: "Tax Services",
      referralSource: "Google",
      type: "client-info",
      source: "website-client-info",
    });

    expect(await screen.findByText(/thank you, jane client/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /\(929\) 933-1396/i })).toHaveAttribute(
      "href",
      "tel:+19299331396"
    );
  });

  it("shows the API error when the response is not successful", async () => {
    vi.stubGlobal("fetch", mockFetchResponse(false, { success: false, error: "Server error" }));

    const user = userEvent.setup();
    render(<ClientInfoForm />);

    await user.type(screen.getByLabelText(/full legal name/i), "Jane Client");
    await user.type(screen.getByLabelText(/phone number/i), "9295550101");
    await user.type(screen.getByLabelText(/^email/i), "jane@example.com");
    await user.click(screen.getByRole("button", { name: /submit information/i }));

    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
  });
});
