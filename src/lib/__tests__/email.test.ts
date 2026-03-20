import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createTransport, sendMail } = vi.hoisted(() => {
  const sendMail = vi.fn().mockResolvedValue(undefined);
  const createTransport = vi.fn(() => ({ sendMail }));
  return { createTransport, sendMail };
});

vi.mock("nodemailer", () => ({
  default: {
    createTransport,
  },
}));

describe("sendContactEmail", () => {
  const originalEnv = {
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    EMAIL_TO: process.env.EMAIL_TO,
  };

  beforeEach(() => {
    process.env.EMAIL_HOST = "smtp.example.com";
    process.env.EMAIL_PORT = "465";
    process.env.EMAIL_USER = "info@example.com";
    process.env.EMAIL_PASS = "secret-pass";
    process.env.EMAIL_TO = "leads@example.com";
    createTransport.mockClear();
    sendMail.mockClear();
  });

  afterEach(() => {
    process.env.EMAIL_HOST = originalEnv.EMAIL_HOST;
    process.env.EMAIL_PORT = originalEnv.EMAIL_PORT;
    process.env.EMAIL_USER = originalEnv.EMAIL_USER;
    process.env.EMAIL_PASS = originalEnv.EMAIL_PASS;
    process.env.EMAIL_TO = originalEnv.EMAIL_TO;
  });

  it("throws when email configuration is missing", async () => {
    delete process.env.EMAIL_HOST;

    const { sendContactEmail } = await import("../email");

    await expect(
      sendContactEmail({
        fullName: "Missing Config",
        phone: "9295550105",
      })
    ).rejects.toThrow(/email not configured/i);
  });

  it("creates a transport and sends a lead email", async () => {
    const { sendContactEmail } = await import("../email");

    await sendContactEmail({
      fullName: "Jane Lead",
      phone: "9295550106",
      email: "jane@example.com",
      businessType: "LLC",
      services: ["Tax Services", "Licensing"],
      message: "Need help",
    });

    expect(createTransport).toHaveBeenCalledWith({
      host: "smtp.example.com",
      port: 465,
      secure: true,
      auth: { user: "info@example.com", pass: "secret-pass" },
    });
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "leads@example.com",
        subject: "New Lead from Advantage Website: Jane Lead",
        replyTo: '"Jane Lead" <jane@example.com>',
      })
    );

    const mail = sendMail.mock.calls[0]?.[0] as { text?: string; html?: string };
    expect(mail.text).toContain("CONTACT LEAD");
    expect(mail.text).toContain("Jane Lead");
    expect(mail.html).toContain("Contact Lead");
    expect(mail.html).toContain("Tax Services, Licensing");
  });

  it("includes booking fields in the email payload", async () => {
    const { sendContactEmail } = await import("../email");

    await sendContactEmail({
      fullName: "Booker",
      phone: "9295550107",
      email: "booker@example.com",
      type: "booking",
      serviceType: "Tax Services",
      preferredDate: "2026-04-01",
      preferredTime: "morning",
      description: "Consultation",
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "New Booking Request from Advantage Website: Booker",
      })
    );

    const mail = sendMail.mock.calls[0]?.[0] as { text?: string; html?: string };
    expect(mail.text).toContain("BOOKING REQUEST");
    expect(mail.text).toContain("Service Type:  Tax Services");
    expect(mail.html).toContain("Booking Request");
    expect(mail.html).toContain("Preferred Date");
  });
});
