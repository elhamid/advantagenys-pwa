import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PHONE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "ITIN / Tax ID Services",
  description:
    "ITIN application and renewal by IRS Certified Acceptance Agent. 2,250+ ITINs processed. No need to mail original documents. On-site verification in Cambria Heights, NY.",
};

const stats = [
  { value: "2,250+", label: "ITINs Successfully Processed" },
  { value: "IRS CAA", label: "Certified Acceptance Agent" },
  { value: "On-Site", label: "Document Verification" },
  { value: "20+ Years", label: "Processing Experience" },
];

const steps = [
  {
    step: "1",
    title: "Bring Your Documents",
    description:
      "Visit our office with your passport or other IRS-accepted identification. We review your documents and determine eligibility on the spot.",
  },
  {
    step: "2",
    title: "On-Site Verification",
    description:
      "As an IRS Certified Acceptance Agent, we verify your identity documents in our office. You keep your originals — no need to mail your passport to the IRS.",
  },
  {
    step: "3",
    title: "We File for You",
    description:
      "We complete IRS Form W-7, attach the certified copies, and submit your ITIN application directly to the IRS. We track it until your number is issued.",
  },
];

const faqs = [
  {
    question: "What is an ITIN?",
    answer:
      "An Individual Taxpayer Identification Number (ITIN) is a tax processing number issued by the IRS for individuals who are required to have a U.S. taxpayer identification number but are not eligible for a Social Security Number. It is a 9-digit number beginning with the number 9.",
  },
  {
    question: "Who needs an ITIN?",
    answer:
      "You need an ITIN if you do not have and are not eligible for a Social Security Number, but you need to file a U.S. tax return, are claimed as a dependent, or need to conduct other tax-related business. This includes non-resident aliens, foreign nationals, and dependents or spouses of U.S. citizens.",
  },
  {
    question: "Why use a Certified Acceptance Agent instead of applying directly?",
    answer:
      "When you apply directly, you must mail your original passport and identification documents to the IRS — and they can take 8-14 weeks to return them. With our Certified Acceptance Agent, we verify your documents on-site. You keep your originals and never risk losing them in the mail.",
  },
  {
    question: "What documents do I need?",
    answer:
      "The primary document is a valid passport. If you do not have a passport, the IRS accepts combinations of other documents including national ID cards, civil birth certificates, foreign driver's licenses, and U.S. state identification cards. We will review your specific situation during your visit.",
  },
  {
    question: "How long does it take to get an ITIN?",
    answer:
      "Processing times vary. Standard IRS processing takes 7-11 weeks from the date of submission. During peak tax season (January-April), it can take longer. We submit applications as quickly as possible and track your application status.",
  },
  {
    question: "Can I file my tax return at the same time?",
    answer:
      "Yes. In most cases, the ITIN application (Form W-7) must be submitted with a federal tax return. We prepare your tax return and ITIN application together as a single package — saving you time and ensuring everything is filed correctly.",
  },
  {
    question: "Do ITINs expire?",
    answer:
      "Yes. ITINs that have not been used on a federal tax return at least once in the last three consecutive tax years will expire. ITINs with middle digits 70-88 have already expired and need renewal. We handle ITIN renewals with the same on-site verification process.",
  },
  {
    question: "How much does ITIN processing cost?",
    answer:
      "Contact us for current pricing. Our fee includes document verification, Form W-7 preparation, tax return filing (if required), and application tracking. No hidden fees.",
  },
];

export default function ItinTaxIdPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 bg-[var(--blue-bg)]">
        <Container>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="success">IRS Certified Acceptance Agent</Badge>
            <Badge>2,250+ ITINs Processed</Badge>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-6 max-w-3xl">
            ITIN / Tax ID Services
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mb-4">
            Get your Individual Taxpayer Identification Number without mailing
            your passport to the IRS. Our IRS Certified Acceptance Agent
            verifies your documents on-site at our Cambria Heights office.
          </p>
          <p className="text-lg font-medium text-[var(--text)] max-w-2xl mb-8">
            Over 2,250 ITINs successfully processed. Fast, reliable, and safe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button href="/contact" size="lg">
              Apply for Your ITIN
            </Button>
            <Button href={`tel:${PHONE.mainTel}`} variant="outline" size="lg">
              Call {PHONE.main}
            </Button>
          </div>
        </Container>
      </section>

      {/* Trust Stats */}
      <section className="py-12">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-[var(--blue-accent)] mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-[var(--text-muted)]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Why Certified Acceptance Agent */}
      <section className="py-16 bg-[var(--blue-bg)]">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[var(--text)] mb-6 text-center">
              Why Use a Certified Acceptance Agent?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                  Keep Your Passport
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Applying directly means mailing your original passport to the
                  IRS for 8-14 weeks. With us, you walk out with your documents
                  the same day.
                </p>
              </Card>
              <Card>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                  No Risk of Lost Documents
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Every year, documents get lost or delayed in the mail. Our
                  on-site verification eliminates that risk entirely.
                </p>
              </Card>
              <Card>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                  Higher Approval Rate
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  With 2,250+ successful applications, we know exactly what the
                  IRS requires. We catch issues before they cause rejections.
                </p>
              </Card>
              <Card>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                  Complete Service
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  We prepare your W-7 application, file your tax return, and
                  track your ITIN until it is issued. One visit, everything
                  handled.
                </p>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Process Steps */}
      <section className="py-16">
        <Container>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-10 text-center">
            How the ITIN Process Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-[var(--blue-accent)] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* What to bring */}
      <section className="py-16 bg-[var(--blue-bg)]">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[var(--text)] mb-6 text-center">
              What to Bring to Your Appointment
            </h2>
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-[var(--text)] mb-3">
                    Primary Document (one required)
                  </h3>
                  <ul className="space-y-2">
                    <li className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                      <span className="text-[var(--green)] mt-0.5">&#10003;</span>
                      Valid, unexpired passport (most common)
                    </li>
                    <li className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                      <span className="text-[var(--green)] mt-0.5">&#10003;</span>
                      National identification card with photo
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text)] mb-3">
                    Supporting Documents
                  </h3>
                  <ul className="space-y-2">
                    <li className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                      <span className="text-[var(--green)] mt-0.5">&#10003;</span>
                      Previous year tax return (if applicable)
                    </li>
                    <li className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                      <span className="text-[var(--green)] mt-0.5">&#10003;</span>
                      Income documents (W-2, 1099, etc.)
                    </li>
                    <li className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                      <span className="text-[var(--green)] mt-0.5">&#10003;</span>
                      Previous ITIN letter (if renewing)
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <Container>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-10 text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-8">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                  {faq.question}
                </h3>
                <p className="text-[var(--text-secondary)]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Cross-sell */}
      <section className="py-16 bg-[var(--blue-bg)]">
        <Container>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-6 text-center">
            After Your ITIN: What Comes Next
          </h2>
          <p className="text-[var(--text-secondary)] text-center max-w-2xl mx-auto mb-10">
            An ITIN opens the door to building your business legally in the
            United States. We help with every step after.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link href="/services/business-formation/">
              <Card hover>
                <h3 className="font-semibold text-[var(--text)] mb-1">
                  Form Your Business
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  LLC, Corporation, or Non-Profit — start your business with
                  the right structure.
                </p>
              </Card>
            </Link>
            <Link href="/services/licensing/">
              <Card hover>
                <h3 className="font-semibold text-[var(--text)] mb-1">
                  Get Licensed
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Contractor, restaurant, retail — we handle the licensing for
                  your industry.
                </p>
              </Card>
            </Link>
            <Link href="/services/tax-services/">
              <Card hover>
                <h3 className="font-semibold text-[var(--text)] mb-1">
                  Ongoing Tax Filing
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  We file your taxes every year using your ITIN. Stay compliant
                  and build your tax history.
                </p>
              </Card>
            </Link>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
              Ready to Get Your ITIN?
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
              Visit our Cambria Heights office or call for an appointment. Bring
              your passport — we handle everything else.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/contact" size="lg">
                Schedule ITIN Appointment
              </Button>
              <Button href={PHONE.whatsappLink} variant="secondary" size="lg">
                WhatsApp Us
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
