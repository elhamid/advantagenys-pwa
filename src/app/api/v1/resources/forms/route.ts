import { NextResponse } from "next/server";
import { activePublicForms } from "./descriptor";

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

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export function GET() {
  const active = activePublicForms();

  return NextResponse.json(
    { forms: active, count: active.length },
    { headers: corsHeaders() }
  );
}
