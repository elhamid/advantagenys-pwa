import { NextResponse, type NextRequest } from "next/server";
import { getFormByShortLinkSlug } from "@/lib/forms";

/**
 * Short-link redirect. `/r/{shortLinkSlug}` → public form URL, preserving
 * any incoming query params (typically UTM). Used by the taskboard CRM for
 * WhatsApp/email outreach.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const form = getFormByShortLinkSlug(slug);
  if (!form) {
    return NextResponse.json(
      { error: "Short link not found", slug },
      { status: 404 }
    );
  }

  // Destination: the PWA form landing page. Supports JotForm embeds,
  // native forms, and external links all through the [slug] route.
  const base = new URL(
    `/resources/forms/${form.slug}`,
    request.url
  );

  // Preserve incoming query params (utm_source, utm_medium, etc.).
  for (const [k, v] of request.nextUrl.searchParams.entries()) {
    base.searchParams.set(k, v);
  }

  return NextResponse.redirect(base, 302);
}
