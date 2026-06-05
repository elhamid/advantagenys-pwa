import type { Metadata } from "next";
import { makeCanonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Tax Savings Estimator | Advantage Services",
  description:
    "Estimate what you could save on business taxes — a free calculator from Advantage Services, NYC.",
  openGraph: {
    title: "Tax Savings Estimator | Advantage Services",
    description:
      "Estimate what you could save on business taxes — a free calculator from Advantage Services, NYC.",
    url: "https://advantagenys.com/tools/tax-savings-estimator",
  },
  alternates: { canonical: makeCanonical("/tools/tax-savings-estimator") },
};

export default function TaxSavingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
