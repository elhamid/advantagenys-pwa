import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CorporateRegistrationForm } from "../CorporateRegistrationForm";

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

describe("CorporateRegistrationForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders the form fields and submit button", () => {
    render(<CorporateRegistrationForm />);

    expect(screen.getByText(/corporate registration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/business owner full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/desired business name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^owner address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/owner ssn/i)).toBeInTheDocument();
    expect(screen.getByText(/filing receipt date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filing receipt date month/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/corporation address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/business website/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit registration/i })).toBeInTheDocument();
  });

  it("submits the registration payload and shows the success state", async () => {
    const fetchSpy = mockFetchResponse(true, { success: true });
    vi.stubGlobal("fetch", fetchSpy);
    window.history.replaceState({}, "", "/resources/forms/corporation-services?shared_by=user-hamid");

    const user = userEvent.setup();
    render(<CorporateRegistrationForm />);

    await user.type(screen.getByLabelText(/business owner full name/i), "Alex Owner");
    await user.type(screen.getByLabelText(/phone number/i), "9295550102");
    await user.type(screen.getByLabelText(/^email/i), "alex@example.com");
    await user.type(screen.getByLabelText(/^owner address/i), "12 Owner Street");
    await user.type(screen.getByLabelText(/owner city/i), "Queens");
    await user.type(screen.getByLabelText(/owner zip code/i), "11377");
    await user.type(screen.getByLabelText(/owner ssn/i), "123-45-6789");
    await user.selectOptions(screen.getByLabelText(/owner date of birth month/i), "01");
    await user.selectOptions(screen.getByLabelText(/owner date of birth day/i), "15");
    await user.selectOptions(screen.getByLabelText(/owner date of birth year/i), "1990");
    await user.type(screen.getByLabelText(/desired business name/i), "Alex LLC");
    await user.selectOptions(screen.getByLabelText(/business type/i), "LLC");
    await user.selectOptions(screen.getByLabelText(/filing receipt date month/i), "06");
    await user.selectOptions(screen.getByLabelText(/filing receipt date day/i), "17");
    await user.selectOptions(screen.getByLabelText(/filing receipt date year/i), "2026");
    await user.type(screen.getByLabelText(/corporation address/i), "41 Corp Avenue");
    await user.type(screen.getByLabelText(/corporation city/i), "Brooklyn");
    await user.type(screen.getByLabelText(/corporation zip code/i), "11211");
    await user.selectOptions(screen.getByLabelText(/who do you want to meet/i), "Jay");
    await user.selectOptions(screen.getByLabelText(/business website/i), "Need SEO / Google presence");
    await user.click(screen.getAllByLabelText(/^yes$/i)[0]);
    await user.click(screen.getByRole("button", { name: /submit registration/i }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledOnce());

    const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/contact");
    expect(JSON.parse(options.body as string)).toMatchObject({
      fullName: "Alex Owner",
      phone: "9295550102",
      email: "alex@example.com",
      desiredBusinessName: "Alex LLC",
      businessType: "LLC",
      ownerAddress: "12 Owner Street",
      ownerCity: "Queens",
      ownerZipCode: "11377",
      ownerSsnOrItin: "123-45-6789",
      ownerDateOfBirth: "1990-01-15",
      filingReceiptDate: "2026-06-17",
      corporationAddress: "41 Corp Avenue",
      corporationCity: "Brooklyn",
      corporationZipCode: "11211",
      meetingPreference: "Jay",
      websiteSeoOptions: "Need SEO / Google presence",
      needEIN: "Yes",
      type: "corporate-registration",
      source: "website-corporate-registration",
      sharedBy: "user-hamid",
    });

    expect(await screen.findByText(/thank you, alex owner/i)).toBeInTheDocument();
  });

  it("shows an error message when the API returns a failure", async () => {
    vi.stubGlobal("fetch", mockFetchResponse(false, { success: false, error: "Server error" }));

    const user = userEvent.setup();
    render(<CorporateRegistrationForm />);

    await user.type(screen.getByLabelText(/business owner full name/i), "Alex Owner");
    await user.type(screen.getByLabelText(/phone number/i), "9295550102");
    await user.type(screen.getByLabelText(/^email/i), "alex@example.com");
    await user.type(screen.getByLabelText(/desired business name/i), "Alex LLC");
    await user.click(screen.getByRole("button", { name: /submit registration/i }));

    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
  });
});
