import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SEGMENTS } from "@/lib/constants";

export function CustomerSegments() {
  return (
    <section className="py-20 bg-[var(--blue-bg)]">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text)]">
            Built for Your Industry
          </h2>
          <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Specialized expertise for the businesses we know best.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SEGMENTS.map((segment, i) => (
            <ScrollReveal key={segment.name} delay={i * 150}>
              <Link href={segment.href}>
                <Card hover className="h-full text-center">
                  <h3 className="text-xl font-semibold text-[var(--text)] mb-2">{segment.name}</h3>
                  <p className="text-[var(--blue-accent)] font-medium mb-3">{segment.tagline}</p>
                  <p className="text-sm text-[var(--text-muted)]">{segment.journey}</p>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
