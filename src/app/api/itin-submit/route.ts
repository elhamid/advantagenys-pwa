import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "This ITIN submission endpoint has moved. Please use /resources/forms/itin-registration-form.",
    },
    { status: 410 },
  );
}
