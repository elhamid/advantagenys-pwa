import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { makeCanonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Advantage Services LLC. Understand the terms governing use of our website and business consulting services.",
  alternates: { canonical: makeCanonical("/terms") },
};

export default function TermsPage() {
  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-[var(--text)] mb-3">Terms of Service</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-12">Last updated: March 2026</p>

          <p className="text-lg text-[var(--text-secondary)] mb-12 leading-relaxed">
            These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the Advantage Services LLC
            website at{" "}
            <a
              href="https://advantagenys.com"
              className="text-[var(--blue-accent)] underline underline-offset-2"
            >
              advantagenys.com
            </a>{" "}
            and the services we provide. Please read these Terms carefully before using our site or engaging our
            services.
          </p>

          {/* Section 1 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">1. Acceptance of Terms</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              By accessing this website or engaging Advantage Services LLC for any service, you agree to
              be bound by these Terms. If you do not agree, please do not use this website or our services. Your
              continued use after any update to these Terms constitutes acceptance of the revised Terms.
            </p>
          </div>

          {/* Section 2 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">2. Services Description</h2>
            <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">
              Advantage Services LLC provides the following services to individuals and small businesses:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[var(--text-secondary)] leading-relaxed">
              <li>Business formation (LLC, corporation, sole proprietorship registration)</li>
              <li>Business licensing and permit assistance</li>
              <li>
                Tax preparation and filing — performed by IRS-certified tax preparers and Acceptance Agents
              </li>
              <li>ITIN (Individual Taxpayer Identification Number) application assistance</li>
              <li>
                Insurance placement — facilitated through our licensed insurance broker partners
              </li>
              <li>IRS audit defense and tax resolution</li>
              <li>Financial consulting and bookkeeping assistance</li>
              <li>
                Legal referrals — we connect clients with licensed attorneys in our network for immigration,
                corporate, and other legal matters
              </li>
            </ul>
            <p className="text-[var(--text-secondary)] mt-4 leading-relaxed">
              The specific scope of services and associated fees for each engagement are confirmed during your
              consultation.
            </p>
          </div>

          {/* Section 3 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">3. Professional Disclaimers</h2>

            <div className="space-y-4">
              <div className="bg-[var(--blue-bg)] rounded-lg p-4">
                <p className="text-sm font-semibold text-[var(--text)] mb-1">IRS Circular 230 Notice</p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Tax advice contained in communications from Advantage Services LLC is not intended or
                  written to be used, and cannot be used, for the purpose of (i) avoiding penalties under the
                  Internal Revenue Code or (ii) promoting, marketing, or recommending to another party any
                  transaction or matter addressed herein.
                </p>
              </div>

              <div className="bg-[var(--blue-bg)] rounded-lg p-4">
                <p className="text-sm font-semibold text-[var(--text)] mb-1">Not a Law Firm</p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Advantage Services LLC is not a law firm and does not provide legal representation.
                  Immigration and legal services are facilitated through licensed attorney partners in our network.
                  Engaging our services for legal referrals does not create an attorney-client relationship with
                  Advantage Services LLC.
                </p>
              </div>

              <div className="bg-[var(--blue-bg)] rounded-lg p-4">
                <p className="text-sm font-semibold text-[var(--text)] mb-1">Insurance</p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Insurance products are offered through licensed insurance professionals. Coverage terms,
                  conditions, and availability are determined by the insurance carrier. We assist with placement and
                  guidance but do not underwrite policies.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">4. Your Responsibilities</h2>
            <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">
              To receive our services effectively, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[var(--text-secondary)] leading-relaxed">
              <li>
                Provide <strong className="text-[var(--text)]">accurate and complete information</strong> when
                completing forms, during consultations, and throughout the service engagement. Errors in information
                you provide may result in government rejection, penalties, or additional fees that are your
                responsibility.
              </li>
              <li>
                Respond to our requests for additional documentation or clarification in a{" "}
                <strong className="text-[var(--text)]">timely manner</strong>. Delays caused by late responses may
                affect filing deadlines and are not our responsibility.
              </li>
              <li>
                Keep documents, account credentials, and communications related to your case{" "}
                <strong className="text-[var(--text)]">confidential</strong> and secure on your end.
              </li>
              <li>
                Use this website for lawful purposes only and not attempt to circumvent security measures or misuse
                any form or service.
              </li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">5. Fees and Payment</h2>
            <ul className="list-disc pl-6 space-y-2 text-[var(--text-secondary)] leading-relaxed">
              <li>
                Service fees are disclosed and agreed upon during your initial consultation before any work begins.
              </li>
              <li>
                Accepted payment methods include Zelle, cash, and other methods confirmed at time of service.
              </li>
              <li>
                <strong className="text-[var(--text)]">Government filing fees</strong> (e.g., IRS, New York State
                DOS, USCIS) are separate from our service fees. Once a government filing has been submitted on your
                behalf, government fees are non-refundable regardless of the outcome of the application.
              </li>
              <li>
                Our service fees are non-refundable once work has been completed or a filing has been submitted,
                except where we have made a documented error on our part.
              </li>
            </ul>
          </div>

          {/* Section 6 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">6. Limitation of Liability</h2>
            <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">
              To the maximum extent permitted by applicable law, Advantage Services LLC is not liable for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[var(--text-secondary)] leading-relaxed">
              <li>
                Delays in government processing, approval timelines, or decisions made by government agencies (IRS,
                USCIS, New York State, or other authorities)
              </li>
              <li>
                Denied applications, rejected filings, or adverse government determinations where the outcome
                results from government policy, eligibility criteria, or information you provided
              </li>
              <li>
                Tax penalties, interest, or assessments arising from inaccurate, incomplete, or misleading
                information provided to us by the client
              </li>
              <li>
                Indirect, incidental, or consequential damages arising from use of this website or our services
              </li>
            </ul>
            <p className="text-[var(--text-secondary)] mt-4 leading-relaxed">
              Our total liability in connection with any service engagement is limited to the fees paid to us for
              that specific service.
            </p>
          </div>

          {/* Section 7 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">7. Intellectual Property</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              All content on this website — including text, graphics, logos, icons, images, and software — is the
              property of Advantage Services LLC and is protected by applicable copyright, trademark, and
              intellectual property laws. You may not reproduce, distribute, or create derivative works from any
              content on this site without our written permission.
            </p>
          </div>

          {/* Section 8 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">8. Termination of Engagement</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Either party may terminate a service engagement with written notice (email is sufficient). Upon
              termination, you are responsible for fees for work completed up to the termination date. We will
              return any original documents you provided and provide a summary of work completed. If termination
              occurs while a time-sensitive filing is pending, we will notify you immediately so you can arrange
              alternative representation.
            </p>
          </div>

          {/* Section 9 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">9. Governing Law</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              These Terms are governed by the laws of the State of New York, without regard to conflict of law
              principles. Any dispute arising under these Terms shall be subject to the exclusive jurisdiction of
              the courts located in Queens County, New York.
            </p>
          </div>

          {/* Section 10 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">10. Changes to These Terms</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              We may update these Terms from time to time. When we do, the &ldquo;Last updated&rdquo; date at the
              top of this page will reflect the change. Continued use of this website or our services after an
              update constitutes acceptance of the revised Terms.
            </p>
          </div>

          {/* Section 11 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">11. Contact Us</h2>
            <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">
              Questions about these Terms or our services? Reach us at:
            </p>
            <address className="not-italic space-y-1 text-[var(--text-secondary)]">
              <p className="font-semibold text-[var(--text)]">Advantage Services LLC</p>
              <p>229-14 Linden Blvd, Cambria Heights, NY 11411</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:info@advantagenys.com"
                  className="text-[var(--blue-accent)] underline underline-offset-2"
                >
                  info@advantagenys.com
                </a>
              </p>
              <p>
                Phone:{" "}
                <a href="tel:+19299331396" className="text-[var(--blue-accent)] underline underline-offset-2">
                  (929) 933-1396
                </a>
              </p>
              <p>
                WhatsApp:{" "}
                <a
                  href="https://wa.me/19299331396"
                  className="text-[var(--blue-accent)] underline underline-offset-2"
                >
                  (929) 933-1396
                </a>
              </p>
              <p>Hours: Monday – Saturday, 10:00 AM – 8:00 PM ET</p>
            </address>
          </div>
        </div>
      </Container>
    </section>
  );
}
