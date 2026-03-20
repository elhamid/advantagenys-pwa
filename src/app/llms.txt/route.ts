import { NextResponse } from "next/server";

export function GET() {
  const content = `# Advantage Services
> Professional business consulting for entrepreneurs in Queens, NYC.
> Tax preparation, business formation, licensing, insurance, legal services, audit defense, and financial services.
> Serving immigrant entrepreneurs, restaurant owners, contractors, and small businesses since 2004.

## Services
- [Tax Services](https://advantagenys.com/services/tax-services): IRS-certified tax preparation, individual and business tax returns, payroll tax, sales tax
- [ITIN Tax ID](https://advantagenys.com/services/tax-services/itin-tax-id): ITIN application and processing by IRS Certified Acceptance Agent
- [Business Formation](https://advantagenys.com/services/business-formation): LLC, Corporation, Non-Profit 501(c)(3), DBA registration
- [Business Licensing](https://advantagenys.com/services/licensing): Home improvement, general contractor, restaurant, food, liquor licenses
- [Insurance](https://advantagenys.com/services/insurance): General liability, workers compensation, disability insurance
- [Audit Defense](https://advantagenys.com/services/audit-defense): Workers comp audit, unemployment insurance audit, sales tax audit, fine reduction
- [Financial Services](https://advantagenys.com/services/financial-services): Bookkeeping, financial statements, business analysis
- [Legal Services](https://advantagenys.com/services/legal): Immigration petitions, citizenship applications, ITIN registration

## Industries We Serve
- [Restaurants](https://advantagenys.com/industries/restaurants): Full licensing, insurance, tax, and compliance for food businesses
- [Contractors](https://advantagenys.com/industries/contractors): Home improvement licensing, insurance, LLC formation, tax planning
- [Immigrant Entrepreneurs](https://advantagenys.com/industries/immigrant-entrepreneurs): ITIN, business formation, licensing, and compliance guidance

## Tools
- [Tax Savings Estimator](https://advantagenys.com/tools/tax-savings-estimator): Calculate potential tax savings
- [Business Readiness Checker](https://advantagenys.com/tools/business-readiness-checker): Assess your business compliance
- [ITIN Eligibility Checker](https://advantagenys.com/tools/itin-eligibility-checker): Check if you qualify for an ITIN

## Contact
- Phone/WhatsApp: (929) 933-1396
- Address: 229-14 Linden Blvd, Cambria Heights, NY 11411
- Hours: Monday-Saturday, 10:00 AM - 8:00 PM ET
- Email: info@advantagenys.com
- Website: https://advantagenys.com
`;

  return new NextResponse(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
