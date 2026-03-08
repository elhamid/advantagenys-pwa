import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

const TESTIMONIALS = [
  {
    quote: "They handled my LLC, insurance, and tax filing all in one place. Saved me weeks of running around.",
    name: "Restaurant Owner",
    location: "Queens, NY",
  },
  {
    quote: "Got my ITIN and LLC set up faster than I expected. They walked me through every step.",
    name: "Immigrant Entrepreneur",
    location: "Brooklyn, NY",
  },
  {
    quote: "When we got audited, Advantage reduced our fine by over 60%. Worth every penny.",
    name: "General Contractor",
    location: "Bronx, NY",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-[var(--blue-bg)]">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text)]">
            Trusted by NYC Businesses
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name}>
              <blockquote className="text-[var(--text)] leading-relaxed mb-4">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="text-sm font-semibold text-[var(--text)]">{t.name}</div>
              <div className="text-xs text-[var(--text-muted)]">{t.location}</div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
