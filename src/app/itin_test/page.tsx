import type { Metadata, Viewport } from "next";
import { ItinKiosk } from "../itin/ItinKiosk";

export const metadata: Metadata = {
  title: "ITIN Test Form",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#1A3A5C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default async function ItinTestPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  const params = await searchParams;
  return <ItinKiosk testMode companySlug={params.company} />;
}
