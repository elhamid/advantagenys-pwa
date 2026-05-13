import { NextRequest } from "next/server";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

const limiter = createRateLimiter(10, 60_000, { label: "api/form-errors" });

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  if (limiter.isLimited(ip)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();

    const formType =
      typeof body.formType === "string" ? body.formType.slice(0, 100) : "unknown";
    const message =
      typeof body.message === "string" ? body.message.slice(0, 1000) : "";
    const stack =
      typeof body.stack === "string" ? body.stack.slice(0, 2000) : undefined;
    const url =
      typeof body.url === "string" ? body.url.slice(0, 500) : undefined;
    const formData =
      typeof body.formData === "object" && body.formData !== null
        ? body.formData
        : undefined;
    const clientTimestamp =
      typeof body.timestamp === "string" ? body.timestamp : undefined;

    console.error(
      "[FORM ERROR]",
      JSON.stringify({
        formType,
        message,
        stack,
        url,
        formData,
        clientTimestamp,
        userAgent: request.headers.get("user-agent"),
        ip,
        serverTimestamp: new Date().toISOString(),
      })
    );

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
