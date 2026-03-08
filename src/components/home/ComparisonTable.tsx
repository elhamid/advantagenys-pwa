import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const ROWS = [
  { feature: "Business Formation", us: true, diy: true, bigFirm: true },
  { feature: "Licensing & Permits", us: true, diy: false, bigFirm: true },
  { feature: "Tax Preparation", us: true, diy: false, bigFirm: true },
  { feature: "Insurance", us: true, diy: false, bigFirm: false },
  { feature: "Audit Defense", us: true, diy: false, bigFirm: false },
  { feature: "ITIN Processing", us: true, diy: false, bigFirm: false },
  { feature: "One Point of Contact", us: true, diy: true, bigFirm: false },
  { feature: "Small Business Pricing", us: true, diy: true, bigFirm: false },
];

function Check() {
  return (
    <svg className="w-5 h-5 text-[var(--green)] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Cross() {
  return (
    <svg className="w-5 h-5 text-[var(--red)] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function ComparisonTable() {
  return (
    <section className="py-20">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text)]">
            Why Advantage Services?
          </h2>
          <p className="mt-4 text-lg text-[var(--text-secondary)]">
            Compare us to doing it yourself or hiring a big firm.
          </p>
        </div>
        <ScrollReveal>
        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl mx-auto text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="py-3 px-4 text-left text-[var(--text-muted)] font-medium">Feature</th>
                <th className="py-3 px-4 text-center font-semibold" style={{ color: "var(--blue-accent)" }}>Advantage Services</th>
                <th className="py-3 px-4 text-center text-[var(--text-muted)] font-medium">DIY</th>
                <th className="py-3 px-4 text-center text-[var(--text-muted)] font-medium">Big Firm</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.feature} className="border-b border-[var(--border)]">
                  <td className="py-3 px-4 text-[var(--text)]">{row.feature}</td>
                  <td className="py-3 px-4">{row.us ? <Check /> : <Cross />}</td>
                  <td className="py-3 px-4">{row.diy ? <Check /> : <Cross />}</td>
                  <td className="py-3 px-4">{row.bigFirm ? <Check /> : <Cross />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
