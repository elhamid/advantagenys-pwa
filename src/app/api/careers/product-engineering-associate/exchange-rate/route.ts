import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface FrankfurterResponse {
  amount?: number;
  base?: string;
  date?: string;
  rates?: {
    INR?: number;
  };
}
export async function GET() {
  try {
    const response = await fetch(
      "https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR",
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Exchange-rate source unavailable." },
        { status: 502 }
      );
    }

    const data = (await response.json()) as FrankfurterResponse;
    const rate = data.rates?.INR;

    if (!rate || !Number.isFinite(rate)) {
      return NextResponse.json(
        { success: false, error: "USD/INR rate was not available." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      base: "USD",
      quote: "INR",
      rate,
      date: data.date,
      source: "Frankfurter reference rates",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Exchange-rate lookup failed." },
      { status: 502 }
    );
  }
}
