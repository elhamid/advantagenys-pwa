export const PHONE = {
  main: "929-933-1396",
  mainTel: "+19299331396",
  whatsapp: "929-933-1396",
  whatsappLink: "https://wa.me/19299331396",
} as const;

export const ADDRESS = {
  street: "229-14 Linden Blvd",
  city: "Cambria Heights",
  state: "NY",
  zip: "11411",
  full: "229-14 Linden Blvd, Cambria Heights, NY 11411",
  googleMaps: "https://maps.google.com/?q=229-14+Linden+Blvd+Cambria+Heights+NY+11411",
} as const;

export const HOURS = {
  days: "Monday - Saturday",
  time: "10:00 AM - 8:00 PM",
  timezone: "ET",
} as const;

export const SERVICES = [
  { name: "ITIN Registration", href: "/resources/forms/itin-registration-form/", icon: "id-badge", description: "IRS Certified Acceptance Agent — no mailing your passport. We certify and file on-site." },
  { name: "Business Formation", href: "/services/business-formation/", icon: "building", description: "LLC, Corporation, Non-Profit setup and filing" },
  { name: "Licensing", href: "/services/licensing/", icon: "id-card", description: "Contractor, restaurant, and retail licensing" },
  { name: "Tax Services", href: "/services/tax-services/", icon: "file-invoice-dollar", description: "Business & personal tax, payroll tax, IRS representation" },
  { name: "Insurance", href: "/services/insurance/", icon: "shield-halved", description: "General liability, workers comp, disability" },
  { name: "Audit Defense", href: "/services/audit-defense/", icon: "scale-balanced", description: "Workers comp, sales tax, UI audit + fine reduction" },
  { name: "Financial Services", href: "/services/financial-services/", icon: "chart-line", description: "Bookkeeping, financial statements, analysis" },
  { name: "Immigration & Legal Services", href: "/services/legal/", icon: "gavel", description: "Immigration, citizenship, divorce, ITIN registration" },
] as const;

export const TEAM = [
  { name: "Jay", fullName: "Sanjay (Jay) Agrawal", role: "President, Licensed Insurance Broker", specialties: ["Insurance", "Licensing", "Formation", "Tax"] },
  { name: "Kedar", fullName: "Kedar Gupta", role: "IRS Certified Tax Preparer & Acceptance Agent", specialties: ["ITIN", "Audit Defense", "Tax", "Fine Reduction"] },
  { name: "Zia", fullName: "Ziaur (Zia) Khan", role: "Consultant", specialties: ["Formation", "Tax", "Licensing", "Payroll", "Consulting"] },
  { name: "Akram", fullName: "Akram Gaffor", role: "Consultant", specialties: ["Insurance", "Tax", "Bookkeeping"] },
  { name: "Riaz", fullName: "Riaz Khan", role: "Consultant", specialties: ["Bookkeeping", "Tax"] },
  { name: "Hamid", fullName: "Hamid Elsevar", role: "Growth Operator", specialties: ["Tech", "AI", "Business Development"] },
] as const;

// Real client stats — based on internal records.
export const STATS = {
  businessSetups: { count: 1700, label: "Business Set-ups", suffix: "+" },
  taxClients: { count: 5700, label: "Tax Clients", suffix: "+" },
  businessLicenses: { count: 2500, label: "Business Licenses", suffix: "+" },
  itWebClients: { count: 150, label: "IT/Web Clients", suffix: "+", estimated: true },
} as const;

export const SEGMENTS = [
  { name: "Contractors", href: "/industries/contractors/", tagline: "We handle the licensing maze", journey: "License -> Insurance -> Tax -> Ongoing" },
  { name: "Restaurants", href: "/industries/restaurants/", tagline: "All permits. One partner.", journey: "Permits -> Compliance -> Tax -> Insurance" },
  { name: "Immigrant Entrepreneurs", href: "/industries/immigrant-entrepreneurs/", tagline: "2,250+ ITINs processed", journey: "ITIN -> LLC -> Tax -> Insurance" },
] as const;
