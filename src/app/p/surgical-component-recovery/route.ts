import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "pwa-auth-surgical-component-recovery";
const HTML_PATH = join(
  process.cwd(),
  "src/app/p/surgical-component-recovery/06-pilot-brief.html"
);

const VALID_TOKENS = new Set([
  "scr-kedar-9m2v6q",
  "kedar-scr-pilot-2026",
]);

let htmlCache: Promise<string> | null = null;

function privateHeaders() {
  return {
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex, nofollow",
  };
}

function getBriefHtml() {
  htmlCache ??= readFile(HTML_PATH, "utf8");
  return htmlCache;
}

export async function GET(request: NextRequest) {
  const tokenParam = request.nextUrl.searchParams.get("token") ?? undefined;
  const tokenCookie = request.cookies.get(COOKIE_NAME)?.value;
  const token = tokenParam ?? tokenCookie;

  if (!token || !VALID_TOKENS.has(token)) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: privateHeaders(),
    });
  }

  const response = new NextResponse(await getBriefHtml(), {
    headers: {
      ...privateHeaders(),
      "Content-Type": "text/html; charset=utf-8",
    },
  });

  if (tokenParam && tokenParam !== tokenCookie) {
    response.cookies.set({
      name: COOKIE_NAME,
      value: tokenParam,
      path: "/p",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}
