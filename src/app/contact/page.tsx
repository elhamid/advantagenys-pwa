import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { ContactFormTabs } from "@/components/contact/ContactFormTabs";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { PHONE, ADDRESS, HOURS } from "@/lib/constants";
import { makeCanonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Advantage Services. Call, WhatsApp, or visit us in Cambria Heights, NY. Free consultation.",
  alternates: { canonical: makeCanonical("/contact") },
};

export default function ContactPage() {
  return (
    <section className="py-20">
      <Container>
        <h1 className="text-4xl font-bold text-[var(--text)] mb-4">Contact Us</h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mb-8">
          Reach out for a free consultation or book an appointment.
        </p>

        {/* Compact Action Row */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row gap-3">
            <a
              href={`tel:${PHONE.mainTel}`}
              className="flex items-center gap-2.5 px-5 py-3.5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--text)] hover:border-[var(--blue-accent)] hover:shadow-sm transition-all"
              style={{ transition: "var(--transition)" }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[var(--blue-accent)] shrink-0"
              >
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              </svg>
              {PHONE.main}
            </a>

            <WhatsAppLink
              href={PHONE.whatsappLink}
              className="flex items-center gap-2.5 px-5 py-3.5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--text)] hover:border-[var(--blue-accent)] hover:shadow-sm transition-all"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-[var(--green)] shrink-0"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 2C6.478 2 2 6.478 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.522 0 10-4.478 10-10S17.522 2 12 2zm0 18a7.96 7.96 0 01-4.11-1.14l-.29-.174-3.01.79.81-2.95-.19-.3A7.96 7.96 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" />
              </svg>
              WhatsApp
            </WhatsAppLink>

            <a
              href={ADDRESS.googleMaps}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-5 py-3.5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--text)] hover:border-[var(--blue-accent)] hover:shadow-sm transition-all"
              style={{ transition: "var(--transition)" }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[var(--blue-accent)] shrink-0"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              229-14 Linden Blvd, Cambria Heights
            </a>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-3">
            {HOURS.days.replace("Monday - Saturday", "Mon–Sat")}, {HOURS.time.replace("10:00 AM - 7:00 PM", "10 AM – 7 PM")} {HOURS.timezone}
          </p>
        </div>

        {/* Forms with Tab Toggle */}
        <div className="max-w-2xl">
          <Suspense fallback={<div className="h-64" />}>
            <ContactFormTabs />
          </Suspense>
        </div>
      </Container>
    </section>
  );
}
