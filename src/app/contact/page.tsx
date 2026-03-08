import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { ContactForm } from "@/components/contact/ContactForm";
import { PHONE, ADDRESS, HOURS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Advantage Business Consulting. Call, WhatsApp, or visit us in Cambria Heights, NY. Free consultation.",
};

export default function ContactPage() {
  return (
    <section className="py-20">
      <Container>
        <h1 className="text-4xl font-bold text-[var(--text)] mb-6">Contact Us</h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mb-12">
          Ready to get started? Reach out for a free consultation.
        </p>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-3">Call Us</h2>
            <a
              href={`tel:${PHONE.mainTel}`}
              className="text-[var(--blue-accent)] font-medium text-lg"
            >
              {PHONE.main}
            </a>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              {HOURS.days}, {HOURS.time} {HOURS.timezone}
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-3">WhatsApp</h2>
            <a
              href={PHONE.whatsappLink}
              className="text-[var(--green)] font-medium text-lg"
            >
              {PHONE.whatsapp}
            </a>
            <p className="text-sm text-[var(--text-muted)] mt-2">Message us anytime</p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-3">Visit Us</h2>
            <a
              href={ADDRESS.googleMaps}
              className="text-[var(--blue-accent)] font-medium"
            >
              {ADDRESS.street}
              <br />
              {ADDRESS.city}, {ADDRESS.state} {ADDRESS.zip}
            </a>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Walk-ins welcome during business hours
            </p>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl">
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
