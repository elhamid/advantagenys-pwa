import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import {
  listRecruitingApplications,
  resolveRecruitingAccessFromRequest,
} from "@/lib/careers/recruiting-review";

export const runtime = "nodejs";

const reviewLimiter = createRateLimiter(30, 60_000, {
  label: "api/careers/product-engineering-associate/review",
});

export const _testing = { reviewLimiter };

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers);
  if (reviewLimiter.isLimited(ip)) {
    return NextResponse.json(
      { success: false, error: "Too many review attempts. Please wait and try again." },
      { status: 429 }
    );
  }

  const access = await resolveRecruitingAccessFromRequest();

  if (!access.allowed) {
    return NextResponse.json(
      { success: false, error: access.reason ?? "Access denied." },
      { status: 403 }
    );
  }

  try {
    const applications = await listRecruitingApplications(access);
    return NextResponse.json({
      success: true,
      scope: access.scope,
      applications,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Review data could not be loaded.",
      },
      { status: 502 }
    );
  }
}
