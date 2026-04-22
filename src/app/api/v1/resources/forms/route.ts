import { NextResponse } from "next/server";
import { forms, type FormConfig } from "@/lib/forms";
import { BASE_URL } from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = 3600; // 1 hour

function corsHeaders() {
  const allowed =
    process.env.NEXT_PUBLIC_TASKBOARD_ORIGIN || "*";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
  };
}

/** Shape returned to taskboard/other consumers — intentionally stable. */
export type PublicFormDescriptor = {
  slug: string;
  title: string;
  description: string;
  category: FormConfig["category"];
  publicUrl: string;
  shortUrl: string | null;
  whatsappText: string | null;
  emailSubject: string | null;
  emailBody: string | null;
  ogImage: string | null;
  active: true;
};

export function toPublicDescriptor(f: FormConfig): PublicFormDescriptor {
  const publicUrl = `${BASE_URL}/resources/forms/${f.slug}`;
  const shortUrl = f.shortLinkSlug ? `${BASE_URL}/r/${f.shortLinkSlug}` : null;
  return {
    slug: f.slug,
    title: f.title,
    description: f.description,
    category: f.category,
    publicUrl,
    shortUrl,
    whatsappText: f.whatsappText ?? null,
    emailSubject: f.emailSubject ?? null,
    emailBody: f.emailBody ?? null,
    ogImage: f.ogImage ?? null,
    active: true,
  };
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export function GET() {
  const active = forms
    .filter((f) => f.active)
    .sort((a, b) => a.priority - b.priority)
    .map(toPublicDescriptor);

  return NextResponse.json(
    { forms: active, count: active.length },
    { headers: corsHeaders() }
  );
}
