import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.error(
      "[CLIENT ERROR]",
      JSON.stringify({
        message: body.message,
        stack: typeof body.stack === "string" ? body.stack.slice(0, 500) : undefined,
        component: typeof body.component === "string" ? body.component.slice(0, 500) : undefined,
        url: body.url,
        userAgent: request.headers.get("user-agent"),
        timestamp: new Date().toISOString(),
      })
    );
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
