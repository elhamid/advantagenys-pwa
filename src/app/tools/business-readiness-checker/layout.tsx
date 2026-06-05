import type { Metadata } from "next";
import { makeCanonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Business Readiness Checker | Advantage Services",
  description:
    "See how ready your business is to launch and what to set up next — a free check from Advantage Services.",
  openGraph: {
    title: "Business Readiness Checker | Advantage Services",
    description:
      "See how ready your business is to launch and what to set up next — a free check from Advantage Services.",
    url: "https://advantagenys.com/tools/business-readiness-checker",
  },
  alternates: { canonical: makeCanonical("/tools/business-readiness-checker") },
};

export default function BusinessReadinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
