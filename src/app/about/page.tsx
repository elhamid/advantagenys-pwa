import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { TEAM, ADDRESS } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { makeCanonical } from "@/lib/seo";

const TEAM_PHOTOS: Record<string, string> = {
  Jay: "/images/team/jay-v2.jpg",
  Kedar: "/images/team/kedar.jpg",
  Zia: "/images/team/zia.jpg",
  Akram: "/images/team/akram.jpg",
  Riaz: "/images/team/riaz-v7.jpg",
  Hamid: "/images/team/hamid-v11.jpg",
};

const PHOTO_POSITIONS: Record<string, string> = {
  Jay: "object-[50%_10%]",
  Kedar: "object-[50%_10%]",
  Zia: "object-[50%_10%]",
  Akram: "object-[50%_10%]",
  Riaz: "object-[50%_10%]",
  Hamid: "object-[50%_10%]",
};

export const metadata: Metadata = {
  title: "About Us",
  description: "Advantage Services LLC. 20+ years serving NYC small businesses with formation, licensing, tax, insurance, and audit defense.",
  alternates: { canonical: makeCanonical("/about") },
};

// Key leads — Jay, Kedar, Zia — emitted as Person JSON-LD for SEO.
const TEAM_LEADS = [
  {
    name: "Sanjay (Jay) Agrawal",
    jobTitle: "President, Licensed Insurance Broker",
    credentials: [
      "NYS Licensed Insurance Broker",
      "Notary Public",
    ],
    knowsAbout: [
      "Business Insurance",
      "Business Licensing",
      "Business Formation",
      "Immigration Consulting",
    ],
  },
  {
    name: "Kedar Gupta",
    jobTitle: "IRS Certified Tax Preparer & Acceptance Agent",
    credentials: [
      "IRS Certifying Acceptance Agent (CAA)",
      "IRS Certified Tax Preparer",
    ],
    knowsAbout: [
      "ITIN Applications",
      "Tax Preparation",
      "Audit Defense",
      "Fine Reduction",
    ],
  },
  {
    name: "Ziaur (Zia) Khan",
    jobTitle: "Consultant — Licensing, Formation, Tax",
    credentials: ["Notary Public"],
    knowsAbout: [
      "Business Licensing",
      "Business Formation",
      "Payroll",
      "Tax Preparation",
    ],
  },
];

export default function AboutPage() {
  return (
    <section className="py-20">
      {TEAM_LEADS.map((p) => (
        <JsonLd
          key={p.name}
          type="Person"
          name={p.name}
          jobTitle={p.jobTitle}
          credentials={p.credentials}
          knowsAbout={p.knowsAbout}
        />
      ))}
      <Container>
        <h1 className="text-4xl font-bold text-[var(--text)] mb-6">About Advantage Services</h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mb-12">
          Advantage Services LLC has been serving NYC small businesses for over 20 years
          from our office in {ADDRESS.city}, {ADDRESS.state}. We are a one-stop shop for all
          business solutions -- formation, licensing, tax, insurance, and audit defense.
        </p>

        <h2 className="text-2xl font-bold text-[var(--text)] mb-6">Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEAM.map((member) => (
            <Card key={member.name}>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={TEAM_PHOTOS[member.name]}
                    alt={member.fullName}
                    fill
                    className={`object-cover ${PHOTO_POSITIONS[member.name]}`}
                    sizes="160px"
                    quality={90}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text)]">{member.fullName}</h3>
                  <p className="text-sm text-[var(--blue-accent)] mb-2">{member.role}</p>
                  <div className="flex flex-wrap gap-1">
                    {member.specialties.map((s) => (
                      <span key={s} className="text-xs bg-[var(--blue-bg)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
