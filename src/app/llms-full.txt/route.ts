import { NextResponse } from "next/server";

export function GET() {
  const content = `# Advantage Services — Full Reference
> Professional business consulting for entrepreneurs in Queens, NYC.
> Tax preparation, business formation, licensing, insurance, legal services, audit defense, and financial services.
> Serving immigrant entrepreneurs, restaurant owners, contractors, and small businesses since 2004.
> Located at 229-14 Linden Blvd, Cambria Heights, NY 11411. Serving all of Queens, Brooklyn, and the NYC metro area.

## About
Advantage Services has been helping small business owners and entrepreneurs navigate the complexities of starting and running a business in New York since 2004. With over 1,700 businesses formed, 5,700+ tax clients served, and 2,500+ licenses obtained, we are a trusted partner for the immigrant and small business community in NYC. Our multilingual team speaks English, Spanish, Hindi, Bengali, Chinese, and Arabic.

## Statistics
- 1,700+ Business Set-ups completed
- 5,700+ Tax Clients served
- 2,500+ Business Licenses obtained
- 2,250+ ITINs processed

## Services

### [Tax Services](https://advantagenys.com/services/tax-services)
IRS-certified tax preparation for individuals and businesses. We handle federal and state tax returns, payroll tax filings, sales tax, and represent clients before the IRS. Our team includes IRS Certified Acceptance Agents qualified to process ITIN applications. We serve self-employed individuals, LLCs, corporations, and foreign nationals.

### [ITIN Tax ID](https://advantagenys.com/services/tax-services/itin-tax-id)
Individual Taxpayer Identification Number (ITIN) application and processing by an IRS Certified Acceptance Agent. We assist foreign nationals, undocumented immigrants, and non-resident aliens who need a tax ID to file returns, open bank accounts, or apply for credit. Same-day processing available in office.

### [Business Formation](https://advantagenys.com/services/business-formation)
Full-service business entity formation including LLC, S-Corp, C-Corp, Non-Profit 501(c)(3), and DBA (Doing Business As) registration. We handle all state filings, EIN registration with the IRS, operating agreements, and publication requirements for New York LLCs. Turnaround typically within days.

### [Business Licensing](https://advantagenys.com/services/licensing)
Complete licensing services for New York businesses. We obtain home improvement contractor licenses, general contractor licenses, restaurant and food handler permits, food protection certificates, liquor licenses, and specialty retail licenses. We know the NYC licensing maze so clients don't have to.

### [Insurance](https://advantagenys.com/services/insurance)
Business insurance through a licensed insurance broker. We provide general liability insurance, workers' compensation insurance, disability insurance, and commercial auto. We shop multiple carriers to find the right coverage and price for each client's business type and size.

### [Audit Defense](https://advantagenys.com/services/audit-defense)
Representation and defense for workers' compensation audits, unemployment insurance (UI) audits, and sales tax audits from the New York State Department of Taxation and Finance. We have a strong track record of fine reduction and audit resolution, often saving clients thousands of dollars.

### [Financial Services](https://advantagenys.com/services/financial-services)
Ongoing bookkeeping, monthly and annual financial statement preparation, cash flow analysis, and business performance reporting. We help small business owners understand their numbers and make informed financial decisions. QuickBooks-compatible workflows available.

### [Immigration & Legal Services](https://advantagenys.com/services/legal)
Document preparation and assistance for immigration petitions, citizenship (naturalization) applications, ITIN registration, and family law matters including uncontested divorce. We serve clients who need affordable, accessible legal document help in multiple languages.

## Industries We Serve

### [Restaurants](https://advantagenys.com/industries/restaurants)
We are a full-service partner for restaurant owners and food entrepreneurs in NYC. Our restaurant clients rely on us for food handler permits, food protection certificates, liquor licenses, general liability and workers' comp insurance, payroll, bookkeeping, and annual tax filings. We understand the compliance demands of the NYC restaurant industry.

### [Contractors](https://advantagenys.com/industries/contractors)
Home improvement contractors and general contractors in NYC need a patchwork of licenses, insurance, and tax compliance. We handle HIC (Home Improvement Contractor) licensing, general liability and workers' comp insurance, LLC formation, and quarterly and annual tax planning. We are a one-stop shop for contractors at any stage.

### [Immigrant Entrepreneurs](https://advantagenys.com/industries/immigrant-entrepreneurs)
We specialize in serving immigrant entrepreneurs who are starting or growing businesses in New York. From ITIN processing and business formation to licensing, insurance, and tax compliance, our multilingual team guides clients through every step. Languages served: English, Spanish, Hindi, Bengali, Chinese, Arabic.

## Tools
- [Tax Savings Estimator](https://advantagenys.com/tools/tax-savings-estimator): Interactive calculator for estimating potential tax savings for small businesses
- [Business Readiness Checker](https://advantagenys.com/tools/business-readiness-checker): Step-by-step assessment of business compliance requirements
- [ITIN Eligibility Checker](https://advantagenys.com/tools/itin-eligibility-checker): Determine if you qualify for an Individual Taxpayer Identification Number

## Team

### Sanjay (Jay) Agrawal — President, Licensed Insurance Broker
Specialties: Insurance, Licensing, Business Formation, Tax. Jay leads the firm and brings decades of experience serving the Queens small business community. He is a licensed insurance broker and handles complex licensing and formation cases.

### Kedar Gupta — IRS Certified Tax Preparer & Acceptance Agent
Specialties: ITIN, Audit Defense, Tax, Fine Reduction. Kedar is an IRS Certified Acceptance Agent authorized to verify identity and process ITIN applications in-office. He leads audit defense engagements and has secured significant fine reductions for clients.

### Ziaur (Zia) Khan — Consultant
Specialties: Business Formation, Tax, Licensing, Payroll, Consulting. Zia handles a wide range of client services including formations, payroll setup, and multi-service consulting engagements.

### Akram Gaffor — Consultant
Specialties: Insurance, Tax, Bookkeeping. Akram supports insurance clients and handles bookkeeping and tax preparation for small business accounts.

### Riaz Khan — Consultant
Specialties: Bookkeeping, Tax. Riaz focuses on bookkeeping accuracy and tax return preparation for individual and business clients.

### Hamid Elsevar — Growth Operator
Specialties: Technology, AI, Business Development. Hamid leads the firm's digital transformation, online presence, and technology integrations.

## Location & Service Area
- Address: 229-14 Linden Blvd, Cambria Heights, NY 11411
- Neighborhood: Cambria Heights, Queens, New York City
- Service Area: All five NYC boroughs, Long Island, and New Jersey
- Google Maps: https://maps.google.com/?q=229-14+Linden+Blvd+Cambria+Heights+NY+11411

## Contact
- Phone/WhatsApp: (929) 933-1396
- Email: info@advantagenys.com
- Website: https://advantagenys.com
- Hours: Monday-Saturday, 10:00 AM - 8:00 PM ET
- Languages: English, Spanish, Hindi, Bengali, Chinese, Arabic

## Online Resources
- Forms & Applications: https://advantagenys.com/resources
- Book a Consultation: https://advantagenys.com/contact
- About Us: https://advantagenys.com/about
`;

  return new NextResponse(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
