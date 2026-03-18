import nodemailer from "nodemailer";

export interface EmailPayload {
  fullName: string;
  phone: string;
  email?: string;
  businessType?: string;
  services?: string[];
  message?: string;
  // Booking-specific
  type?: "booking";
  serviceType?: string;
  preferredDate?: string;
  preferredTime?: string;
  description?: string;
}

function buildSubject(payload: EmailPayload): string {
  const label = payload.type === "booking" ? "New Booking Request" : "New Lead";
  return `${label} from Advantage Website: ${payload.fullName}`;
}

function buildHtmlBody(payload: EmailPayload): string {
  const isBooking = payload.type === "booking";
  const rows: Array<[string, string | undefined]> = [
    ["Name", payload.fullName],
    ["Phone", payload.phone],
    ["Email", payload.email],
    ["Business Type", payload.businessType],
    ["Services", payload.services?.join(", ")],
    ["Message", payload.message],
  ];

  if (isBooking) {
    rows.push(
      ["Service Type", payload.serviceType],
      ["Preferred Date", payload.preferredDate],
      ["Preferred Time", payload.preferredTime],
      ["Description", payload.description]
    );
  }

  const tableRows = rows
    .filter(([, value]) => value !== undefined && value !== "")
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; color: #374151; background: #f9fafb; white-space: nowrap; vertical-align: top; border-bottom: 1px solid #e5e7eb;">${label}</td>
          <td style="padding: 8px 12px; color: #111827; vertical-align: top; border-bottom: 1px solid #e5e7eb;">${value}</td>
        </tr>`
    )
    .join("");

  const badgeColor = isBooking ? "#4F56E8" : "#10b981";
  const badgeLabel = isBooking ? "Booking Request" : "Contact Lead";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin: 0; padding: 0; background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #4F56E8; padding: 24px 32px;">
      <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">Advantage Business Consulting</h1>
      <p style="margin: 4px 0 0; color: #c7d2fe; font-size: 14px;">New submission from advantagenys.com</p>
    </div>
    <div style="padding: 24px 32px;">
      <span style="display: inline-block; background: ${badgeColor}; color: #ffffff; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px;">${badgeLabel}</span>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; font-size: 14px;">
        ${tableRows}
      </table>
    </div>
    <div style="padding: 16px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">Sent at ${new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "full", timeStyle: "short" })} ET · advantagenys.com</p>
    </div>
  </div>
</body>
</html>`;
}

function buildTextBody(payload: EmailPayload): string {
  const isBooking = payload.type === "booking";
  const lines = [
    `${isBooking ? "BOOKING REQUEST" : "CONTACT LEAD"} — Advantage Website`,
    `Submitted: ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })} ET`,
    "",
    `Name:          ${payload.fullName}`,
    `Phone:         ${payload.phone}`,
    payload.email ? `Email:         ${payload.email}` : null,
    payload.businessType ? `Business Type: ${payload.businessType}` : null,
    payload.services?.length ? `Services:      ${payload.services.join(", ")}` : null,
    payload.message ? `Message:       ${payload.message}` : null,
  ];

  if (isBooking) {
    lines.push(
      payload.serviceType ? `Service Type:  ${payload.serviceType}` : null,
      payload.preferredDate ? `Preferred Date: ${payload.preferredDate}` : null,
      payload.preferredTime ? `Preferred Time: ${payload.preferredTime}` : null,
      payload.description ? `Description:   ${payload.description}` : null
    );
  }

  return lines.filter((l): l is string => l !== null).join("\n");
}

export async function sendContactEmail(payload: EmailPayload): Promise<void> {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT ?? "465", 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const to = process.env.EMAIL_TO;

  if (!host || !user || !pass || !to) {
    throw new Error(
      "Email not configured: EMAIL_HOST, EMAIL_USER, EMAIL_PASS, and EMAIL_TO are required."
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"Advantage Website" <${user}>`,
    to,
    replyTo: payload.email ? `"${payload.fullName}" <${payload.email}>` : undefined,
    subject: buildSubject(payload),
    text: buildTextBody(payload),
    html: buildHtmlBody(payload),
  });
}
