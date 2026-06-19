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
    expect(screen.getByLabelText(/owner ssn \/ itin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/owner date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/desired business name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/number of owners/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/corporation mailing address/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit registration/i })).toBeInTheDocument();
  });

  it("submits the registration payload and shows the success state", async () => {
    const fetchSpy = mockFetchResponse(true, { success: true });
    vi.stubGlobal("fetch", fetchSpy);

    const user = userEvent.setup();
    render(<CorporateRegistrationForm />);

    await user.type(screen.getByLabelText(/business owner full name/i), "Alex Owner");
    await user.type(screen.getByLabelText(/phone number/i), "9295550102");
    await user.type(screen.getByLabelText(/^email/i), "alex@example.com");
    await user.type(screen.getByLabelText(/owner ssn \/ itin/i), "123-45-6789");
    await user.type(screen.getByLabelText(/owner date of birth/i), "1990-01-15");
    await user.clear(screen.getByLabelText(/number of owners/i));
    await user.type(screen.getByLabelText(/number of owners/i), "2");
    await user.type(screen.getAllByLabelText(/^full name$/i)[0], "Second Owner");
    await user.type(screen.getAllByLabelText(/ssn \/ itin/i)[1], "987-65-4321");
    await user.type(screen.getByLabelText(/desired business name/i), "Alex LLC");
    await user.selectOptions(screen.getByLabelText(/business type/i), "LLC");
    await user.type(screen.getByLabelText(/corporation mailing address/i), "229-14 Linden Blvd");
    await user.click(screen.getAllByLabelText(/^yes$/i)[0]);
    await user.click(screen.getByRole("button", { name: /submit registration/i }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledOnce());

    const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/contact");
    expect(JSON.parse(options.body as string)).toMatchObject({
      fullName: "ALEX OWNER",
      ownerName: "ALEX OWNER",
      phone: "9295550102",
      email: "alex@example.com",
      businessName: "Alex LLC",
      desiredBusinessName: "Alex LLC",
      businessType: "LLC",
      ownerSsnOrItin: "123-45-6789",
      ownerDateOfBirth: "1990-01-15",
      corporationAddress: "229-14 LINDEN BLVD",
      numberOfOwners: 2,
      additionalOwner2Name: "SECOND OWNER",
      additionalOwner2SsnOrItin: "987-65-4321",
      services: ["Business Formation"],
      serviceType: "Business Formation",
      needEIN: "Yes",
      type: "corporate-registration",
      source: "website-corporate-registration",
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
