import { NextResponse, type NextRequest } from "next/server";
import { getFormByShortLinkSlug } from "@/lib/forms";

/**
 * Short-link redirect. `/r/{shortLinkSlug}` → public form URL, preserving
 * any incoming query params (typically UTM). Used by the taskboard CRM for
 * WhatsApp/email outreach.
 *
 * PAGE_SHORT_LINKS: awning/storefront QR codes that go to site pages (not
 * forms). UTM params are baked into the destination; incoming params are also
 * preserved and can override baked-in values if needed later without
 * reprinting QR codes.
 */
const PAGE_SHORT_LINKS: Record<string, string> = {
  ai: "/services/web-presence?utm_source=awning-side&utm_medium=storefront-sign&utm_campaign=awning-2026",
  walkin: "/book?utm_source=awning-door&utm_medium=storefront-sign&utm_campaign=awning-2026",
  store: "/?utm_source=awning-window-qr&utm_medium=storefront-sign&utm_campaign=awning-2026",
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  // Check page short links first (awning/storefront QR codes).
  if (slug in PAGE_SHORT_LINKS) {
    const dest = new URL(PAGE_SHORT_LINKS[slug], request.url);
    // Preserve any incoming query params — they override baked-in UTMs if
    // the same key appears, allowing future campaign overrides without
    // reprinting QR codes.
    for (const [k, v] of request.nextUrl.searchParams.entries()) {
      dest.searchParams.set(k, v);
    }
    return NextResponse.redirect(dest, 302);
  }

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
