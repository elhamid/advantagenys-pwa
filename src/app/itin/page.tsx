import type { Metadata, Viewport } from "next";
import { ItinKiosk } from "./ItinKiosk";
import { ItinErrorBoundary } from "./ItinErrorBoundary";

export const metadata: Metadata = {
  title: "ITIN Application — IRS Certified Acceptance Agent",
  description:
    "Apply for your Individual Taxpayer Identification Number (ITIN). IRS Certified Acceptance Agent on-site — no mailing your passport. Fast processing for contractors and immigrant workers.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#1A3A5C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default async function ItinPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  const params = await searchParams;
  return (
    <ItinErrorBoundary>
      <ItinKiosk companySlug={params.company} />
    </ItinErrorBoundary>
  );
}
