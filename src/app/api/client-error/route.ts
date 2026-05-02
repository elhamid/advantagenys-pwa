import { NextRequest } from "next/server";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

const limiter = createRateLimiter(10, 60_000, { label: "api/client-error" });

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  if (limiter.isLimited(ip)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const message = typeof body.message === "string" ? body.message.slice(0, 1000) : "";
    const stack = typeof body.stack === "string" ? body.stack.slice(0, 1000) : "";
    const url = typeof body.url === "string" ? body.url.slice(0, 500) : "";
    const component = typeof body.component === "string" ? body.component.slice(0, 200) : "";

    console.error(
      "[CLIENT ERROR]",
      JSON.stringify({
        message,
        stack: stack || undefined,
        component: component || undefined,
        url: url || undefined,
        userAgent: request.headers.get("user-agent"),
        timestamp: new Date().toISOString(),
      })
    );
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
