export interface FormConfig {
  id: string;
  title: string;
  description: string;
  category: "tax" | "business" | "insurance" | "immigration" | "licensing" | "financial" | "other";
  platform: "jotform" | "google" | "native";
  type?: "form" | "link";
  embedUrl?: string;
  nativeComponent?: string;
  linkUrl?: string;
  active: boolean;
  priority: number;
  encrypted?: boolean;
  slug: string;
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export const forms: FormConfig[] = [
  {
    id: "210224697492156",
    title: "ITIN Registration Form",
    description: "Apply for your Individual Tax ID Number (W-7)",
    category: "tax",
    platform: "jotform",
    embedUrl: "https://form.jotform.com/210224697492156",
    active: true,
    priority: 1,
    slug: toSlug("ITIN Registration Form"),
  },
  {
    id: "220756155957061",
    title: "Profit & Loss Form",
    description: "Submit your business P&L information",
    category: "financial",
    platform: "jotform",
    embedUrl: "https://form.jotform.com/220756155957061",
    active: true,
    priority: 2,
    slug: toSlug("Profit & Loss Form"),
  },
  {
    id: "230235945738159",
    title: "Tax Return Questionnaire",
    description: "Complete your annual tax return intake",
    category: "tax",
    platform: "jotform",
    embedUrl: "https://form.jotform.com/230235945738159",
    active: true,
    priority: 3,
    encrypted: true,
    slug: toSlug("Tax Return Questionnaire"),
  },
  {
    id: "220887424251052",
    title: "Immigration Form for Petitioner",
    description: "I-130/I-864 petition filing",
    category: "immigration",
    platform: "jotform",
    embedUrl: "https://form.jotform.com/220887424251052",
    active: true,
    priority: 4,
    slug: toSlug("Immigration Form for Petitioner"),
  },
  {
    id: "220896671023154",
    title: "Immigration Form for Beneficiary",
    description: "Beneficiary information for green card",
    category: "immigration",
    platform: "jotform",
    embedUrl: "https://form.jotform.com/220896671023154",
    active: true,
    priority: 5,
    slug: toSlug("Immigration Form for Beneficiary"),
  },
  {
    id: "253426701953054",
    title: "L2-V3-HIL-NYC Qualification Check",
    description: "Check your HIC license eligibility",
    category: "licensing",
    platform: "jotform",
    embedUrl: "https://form.jotform.com/253426701953054",
    active: true,
    priority: 6,
    slug: toSlug("L2-V3-HIL-NYC Qualification Check"),
  },
  {
    id: "241705190161044",
    title: "BOIR Form",
    description: "Beneficial Ownership Information Report",
    category: "business",
    platform: "jotform",
    embedUrl: "https://form.jotform.com/241705190161044",
    active: true,
    priority: 7,
    slug: toSlug("BOIR Form"),
  },
  {
    id: "241966156522056",
    title: "Citizenship Info Form",
    description: "N-400 naturalization application",
    category: "immigration",
    platform: "jotform",
    embedUrl: "https://form.jotform.com/241966156522056",
    active: true,
    priority: 8,
    slug: toSlug("Citizenship Info Form"),
  },
  {
    id: "221784773077062",
    title: "Divorce Application",
    description: "Uncontested divorce filing",
    category: "other",
    platform: "jotform",
    embedUrl: "https://form.jotform.com/221784773077062",
    active: true,
    priority: 9,
    slug: toSlug("Divorce Application"),
  },
  {
    id: "222615377389062",
    title: "Sales Tax Return Form",
    description: "Quarterly/annual NYS sales tax filing",
    category: "tax",
    platform: "jotform",
    embedUrl: "https://form.jotform.com/222615377389062",
    active: true,
    priority: 10,
    slug: toSlug("Sales Tax Return Form"),
  },
  {
    id: "260414184804049",
    title: "Bookkeeping Form",
    description: "Upload bank statements and financial documents",
    category: "financial",
    platform: "jotform",
    embedUrl: "https://form.jotform.com/260414184804049",
    active: true,
    priority: 11,
    slug: toSlug("Bookkeeping Form"),
  },
  {
    id: "243156342192150",
    title: "New I-130 Petitioner",
    description: "Updated immigration petition form",
    category: "immigration",
    platform: "jotform",
    embedUrl: "https://form.jotform.com/243156342192150",
    active: true,
    priority: 12,
    slug: toSlug("New I-130 Petitioner"),
  },
  {
    id: "243156183104146",
    title: "New I-130 Beneficiary",
    description: "Updated beneficiary information form",
    category: "immigration",
    platform: "jotform",
    embedUrl: "https://form.jotform.com/243156183104146",
    active: true,
    priority: 13,
    slug: toSlug("New I-130 Beneficiary"),
  },
  {
    id: "253344597070157",
    title: "L1-HIL Auto 02",
    description: "Automated HIC license processing",
    category: "licensing",
    platform: "jotform",
    embedUrl: "https://form.jotform.com/253344597070157",
    active: true,
    priority: 14,
    slug: toSlug("L1-HIL Auto 02"),
  },
  {
    id: "253484272415054",
    title: "HIC Auto Processing",
    description: "HIC license auto-qualification",
    category: "licensing",
    platform: "jotform",
    embedUrl: "https://form.jotform.com/253484272415054",
    active: true,
    priority: 15,
    slug: toSlug("HIC Auto Processing"),
  },
  {
    id: "native-client-info",
    title: "Basic Info / Client Intake",
    description: "New client registration",
    category: "other",
    platform: "native",
    nativeComponent: "ClientInfoForm",
    active: true,
    priority: 16,
    slug: toSlug("Basic Info Client Intake"),
  },
  {
    id: "native-corp",
    title: "Corporation Services",
    description: "Corporate registration form",
    category: "business",
    platform: "native",
    nativeComponent: "CorporateRegistrationForm",
    active: true,
    priority: 17,
    slug: toSlug("Corporation Services"),
  },
  {
    id: "native-insurance",
    title: "Client Form for Insurance",
    description: "Insurance intake form",
    category: "insurance",
    platform: "native",
    nativeComponent: "InsuranceForm",
    active: true,
    priority: 18,
    slug: toSlug("Client Form for Insurance"),
  },
  {
    id: "link-office-address",
    title: "Office Address",
    description: "229-14 Linden Blvd, Cambria Heights, NY 11411",
    category: "other",
    platform: "native",
    type: "link",
    linkUrl: "https://maps.google.com/?q=229-14+Linden+Blvd+Cambria+Heights+NY+11411",
    active: true,
    priority: 19,
    slug: toSlug("Office Address"),
  },
  {
    id: "link-abc-google-reviews",
    title: "ABC Google Reviews",
    description: "Leave a review for Advantage Services",
    category: "other",
    platform: "native",
    type: "link",
    linkUrl: "https://g.page/r/CZy_8wX9_yQNEBM/review",
    active: true,
    priority: 20,
    slug: toSlug("ABC Google Reviews"),
  },
  {
    id: "link-itin-google-reviews",
    title: "ITIN Google Reviews",
    description: "Leave a review for ITIN services",
    category: "other",
    platform: "native",
    type: "link",
    linkUrl: "https://g.page/r/CZy_8wX9_yQNEBM/review",
    active: true,
    priority: 21,
    slug: toSlug("ITIN Google Reviews"),
  },
  {
    id: "link-zelle-info",
    title: "Zelle Payment Info",
    description: "Payment via Zelle to 229advantage@gmail.com or (929) 292-9230",
    category: "other",
    platform: "native",
    type: "link",
    linkUrl: "https://www.zellepay.com",
    active: true,
    priority: 22,
    slug: toSlug("Zelle Payment Info"),
  },
  {
    id: "native-home-improvement",
    title: "Home Improvement Licensing",
    description: "Home improvement contractor license application",
    category: "licensing",
    platform: "native",
    nativeComponent: "HomeImprovementForm",
    active: true,
    priority: 23,
    slug: toSlug("Home Improvement Licensing"),
  },
];

export const categories = [
  { key: "all" as const, label: "All" },
  { key: "tax" as const, label: "Tax Services" },
  { key: "business" as const, label: "Business Formation" },
  { key: "insurance" as const, label: "Insurance" },
  { key: "immigration" as const, label: "Immigration" },
  { key: "licensing" as const, label: "Licensing" },
  { key: "financial" as const, label: "Financial" },
  { key: "other" as const, label: "Other" },
] as const;

export type CategoryKey = (typeof categories)[number]["key"];

export const categoryColors: Record<FormConfig["category"], string> = {
  tax: "bg-blue-50 text-blue-700",
  business: "bg-emerald-50 text-emerald-700",
  insurance: "bg-amber-50 text-amber-700",
  immigration: "bg-purple-50 text-purple-700",
  licensing: "bg-orange-50 text-orange-700",
  financial: "bg-cyan-50 text-cyan-700",
  other: "bg-gray-50 text-gray-700",
};

export function getFormBySlug(slug: string): FormConfig | undefined {
  return forms.find((f) => f.slug === slug);
}

export function getFormsByCategory(category: CategoryKey): FormConfig[] {
  const activeForms = forms.filter((f) => f.active).sort((a, b) => a.priority - b.priority);
  if (category === "all") return activeForms;
  return activeForms.filter((f) => f.category === category);
}
