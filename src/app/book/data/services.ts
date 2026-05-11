export interface ServiceData {
  slug: string;
  label: string;
  description: string;
}

export const SERVICES: ServiceData[] = [
  {
    slug: "tax",
    label: "Tax Services",
    description: "Personal & business returns, IRS response, self-employed",
  },
  {
    slug: "itin",
    label: "ITIN / Tax ID",
    description: "IRS Certified Agent — W-7 application, renewals, dependents",
  },
  {
    slug: "formation",
    label: "Business Formation",
    description: "LLC, Corporation, DBA — filed same week",
  },
  {
    slug: "insurance",
    label: "Insurance",
    description: "General liability, workers' comp, commercial auto",
  },
  {
    slug: "audit",
    label: "Audit Defense",
    description: "IRS & state audit representation, penalty abatement",
  },
  {
    slug: "consulting",
    label: "Business Consulting",
    description: "Licensing, permits, contracts, strategic guidance",
  },
  {
    slug: "legal",
    label: "Immigration & Legal",
    description: "Immigration petitions, citizenship, divorce, legal compliance",
  },
  {
    slug: "licensing",
    label: "Licensing",
    description: "Business licenses, permits, renewals, compliance filings",
  },
  {
    slug: "bookkeeping",
    label: "Financial Services",
    description: "Bookkeeping, payroll, financial reporting, QuickBooks setup",
  },
];

export const SERVICE_PREP: Record<string, string[]> = {
  itin: [
    "Valid passport (or certified copy)",
    "Completed W-7 form",
    "Federal tax return",
  ],
  tax: [
    "W-2s, 1099s, and other income documents",
    "Prior year tax return",
    "Photo ID",
    "SSN/ITIN for all filers",
  ],
  legal: [
    "Passport",
    "I-94 arrival record",
    "Prior petitions or approvals",
    "Birth and marriage certificates",
  ],
  formation: [
    "Desired business name",
    "Member/officer information",
    "Business address",
  ],
  insurance: [
    "Current insurance policy",
    "Business financials",
    "Employee count",
    "Payroll information",
  ],
  licensing: [
    "Photo ID",
    "Business address proof",
    "Insurance certificate",
  ],
};

export function getServiceLabel(slug: string | undefined): string {
  if (!slug) return "consult";
  const match = SERVICES.find((s) => s.slug === slug.toLowerCase());
  return match ? match.label : slug;
}
