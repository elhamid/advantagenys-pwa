import { NextResponse } from "next/server";
import { getFormBySlug } from "@/lib/forms";
import { toPublicDescriptor } from "../route";

export const dynamic = "force-static";
export const revalidate = 3600;

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

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const form = getFormBySlug(slug);
  if (!form || !form.active) {
    return NextResponse.json(
      { error: "Form not found or inactive", slug },
      { status: 404, headers: corsHeaders() }
    );
  }
  return NextResponse.json(toPublicDescriptor(form), {
    headers: corsHeaders(),
  });
}
