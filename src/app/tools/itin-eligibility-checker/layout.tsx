import type { Metadata } from "next";
import { makeCanonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "ITIN Eligibility Checker | Advantage Services",
  description:
    "Check in minutes whether you qualify for an ITIN — free, from IRS Certified Acceptance Agents in Queens, NYC.",
  openGraph: {
    title: "ITIN Eligibility Checker | Advantage Services",
    description:
      "Check in minutes whether you qualify for an ITIN — free, from IRS Certified Acceptance Agents in Queens, NYC.",
    url: "https://advantagenys.com/tools/itin-eligibility-checker",
  },
  alternates: { canonical: makeCanonical("/tools/itin-eligibility-checker") },
};

export default function ITINEligibilityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
