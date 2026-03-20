import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ADDRESS, HOURS, PHONE } from "@/lib/constants";
import ContactPage, { metadata } from "../page";

vi.mock("@/components/ui/Container", () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/contact/ContactFormTabs", () => ({
  ContactFormTabs: () => <div>ContactFormTabs</div>,
}));

describe("ContactPage", () => {
  it("exports contact metadata", () => {
    expect(metadata.title).toBe("Contact");
    expect(metadata.description).toMatch(/free consultation/i);
  });

  it("renders the contact page content and action links", () => {
    render(<ContactPage />);

    expect(screen.getByRole("heading", { name: /contact us/i })).toBeInTheDocument();
    expect(screen.getByText("ContactFormTabs")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: PHONE.main })).toHaveAttribute("href", `tel:${PHONE.mainTel}`);
    expect(screen.getByRole("link", { name: /whatsapp/i })).toHaveAttribute("href", PHONE.whatsappLink);
    expect(screen.getByText(new RegExp(`${ADDRESS.street}, ${ADDRESS.city}`, "i"))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(HOURS.days.replace("Monday - Saturday", "Mon–Sat"), "i"))).toBeInTheDocument();
  });
});
