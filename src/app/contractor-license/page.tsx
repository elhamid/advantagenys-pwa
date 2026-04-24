import type { Metadata } from "next";
import { makeCanonical } from "@/lib/seo";
import { ContractorQualifierWizard } from "./ContractorQualifierWizard";

export const metadata: Metadata = {
  title: "Contractor License Qualifier | Advantage Business Consulting",
  description:
    "Find out if you qualify for a NYC Home Improvement Contractor (HIC) or General Contractor (GC) license. Takes about 2 minutes.",
  alternates: { canonical: makeCanonical("/contractor-license") },
};

export default function ContractorLicensePage() {
  return <ContractorQualifierWizard />;
}
