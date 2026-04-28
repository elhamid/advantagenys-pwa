import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/push/subscribe
 *
 * Receives a Web Push subscription object from the client and forwards it
 * upstream to the taskboard push-registration endpoint (best-effort).
 *
 * Body: { subscription: PushSubscription, appointment_id?: string }
 */
export async function POST(req: NextRequest) {
  let body: { subscription: unknown; appointment_id?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.subscription) {
    return NextResponse.json({ error: "Missing subscription" }, { status: 400 });
  }

  // Forward upstream to taskboard best-effort
  const taskboardBase =
    process.env.NEXT_PUBLIC_BOOK_API_BASE ?? "https://app.advantagenys.com";

  try {
    const upstream = await fetch(`${taskboardBase}/api/push/register-subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscription: body.subscription,
        appointment_id: body.appointment_id ?? null,
        source: "pwa",
      }),
      // Don't let a slow taskboard stall the PWA response
      signal: AbortSignal.timeout(5000),
    });

    if (!upstream.ok) {
      // Log but don't fail — PWA side is complete
      console.warn(
        "[push/subscribe] upstream responded",
        upstream.status,
        await upstream.text().catch(() => "")
      );
    }
  } catch (err) {
    // Upstream unreachable or timed out — non-fatal
    console.warn("[push/subscribe] upstream call failed:", err);
  }

  return NextResponse.json({ ok: true });
}
