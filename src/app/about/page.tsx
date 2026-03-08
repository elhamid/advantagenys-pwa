import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { TEAM, ADDRESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us",
  description: "Advantage Business Consulting LLC. 20+ years serving NYC small businesses with formation, licensing, tax, insurance, and audit defense.",
};

export default function AboutPage() {
  return (
    <section className="py-20">
      <Container>
        <h1 className="text-4xl font-bold text-[var(--text)] mb-6">About Advantage Services</h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mb-12">
          Advantage Business Consulting LLC has been serving NYC small businesses for over 20 years
          from our office in {ADDRESS.city}, {ADDRESS.state}. We are a one-stop shop for all
          business solutions -- formation, licensing, tax, insurance, and audit defense.
        </p>

        <h2 className="text-2xl font-bold text-[var(--text)] mb-6">Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEAM.map((member) => (
            <Card key={member.name}>
              <h3 className="text-lg font-semibold text-[var(--text)]">{member.fullName}</h3>
              <p className="text-sm text-[var(--blue-accent)] mb-2">{member.role}</p>
              <div className="flex flex-wrap gap-1">
                {member.specialties.map((s) => (
                  <span key={s} className="text-xs bg-[var(--blue-bg)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
