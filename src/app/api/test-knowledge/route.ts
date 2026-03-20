import { findRelevantKnowledge } from "@/lib/chat/knowledge";
import { NextResponse } from "next/server";

export async function GET() {
  const results = await findRelevantKnowledge("tax");
  return NextResponse.json({ count: results.length, results });
}
