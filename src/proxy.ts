import { NextRequest, NextResponse } from "next/server";

function isLegacyBrowser(ua: string): boolean {
  // iOS Safari version < 16
  const iosSafari = ua.match(/OS (\d+)_/);
  if (iosSafari && parseInt(iosSafari[1]) < 16) return true;

  // Android WebView or Chrome < 90
  const chrome = ua.match(/Chrome\/(\d+)/);
  if (chrome && parseInt(chrome[1]) < 90 && !ua.includes("Edg/")) return true;

  // Old Firefox < 100
  const firefox = ua.match(/Firefox\/(\d+)/);
  if (firefox && parseInt(firefox[1]) < 100) return true;

  // IE
  if (ua.includes("MSIE") || ua.includes("Trident/")) return true;

  return false;
}

export function proxy(request: NextRequest) {
  const ua = request.headers.get("user-agent") || "";
  const path = request.nextUrl.pathname;

  if (path === "/itin" || path.startsWith("/itin/")) {
    const url = new URL("/resources/forms/itin-registration-form", request.url);
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });
    return NextResponse.redirect(url);
  }

  // Don't redirect if already on legacy pages, API routes, or static files
  if (
    path.startsWith("/legacy") ||
    path.startsWith("/api/") ||
    path.startsWith("/_next/") ||
    path.startsWith("/icons/") ||
    path.startsWith("/images/") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  if (isLegacyBrowser(ua)) {
    return NextResponse.redirect(new URL("/legacy", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
