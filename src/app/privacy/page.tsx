import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Advantage Business Consulting LLC. Learn how we collect, use, and protect your personal and business information.",
};

export default function PrivacyPage() {
  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-[var(--text)] mb-3">Privacy Policy</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-12">Last updated: March 2026</p>

          <p className="text-lg text-[var(--text-secondary)] mb-12 leading-relaxed">
            Advantage Business Consulting LLC (&ldquo;Advantage,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or
            &ldquo;us&rdquo;) is committed to protecting your privacy. This policy explains what information we
            collect, how we use it, and what choices you have.
          </p>

          {/* Section 1 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">1. Information We Collect</h2>
            <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[var(--text-secondary)] leading-relaxed">
              <li>
                <strong className="text-[var(--text)]">Contact information</strong> — name, phone number, email
                address, and mailing address submitted through our contact form or service intake forms.
              </li>
              <li>
                <strong className="text-[var(--text)]">Business information</strong> — business name, type of
                entity, industry, and desired business structure provided during consultations or form submissions.
              </li>
              <li>
                <strong className="text-[var(--text)]">Tax and financial information</strong> — Social Security
                Numbers, ITINs, EINs, income records, and prior tax returns collected via JotForm embedded forms
                during tax preparation or ITIN service intake.
              </li>
              <li>
                <strong className="text-[var(--text)]">Immigration information</strong> — visa status, country of
                origin, passport details, and related documentation collected via JotForm embedded forms for
                immigration-related services.
              </li>
            </ul>
            <p className="text-[var(--text-secondary)] mt-4 leading-relaxed">
              Our native contact form (on the Contact page) collects name, email, phone, and message only.
              JotForm-embedded forms on our Resources pages collect the additional service-specific information
              listed above and are processed under JotForm&apos;s platform.
            </p>
          </div>

          {/* Section 2 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">2. How We Collect Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-[var(--text-secondary)] leading-relaxed">
              <li>
                <strong className="text-[var(--text)]">Directly from you</strong> — via our website contact form,
                JotForm service intake forms, in-person consultations, phone, email, and WhatsApp.
              </li>
              <li>
                <strong className="text-[var(--text)]">Automatically</strong> — Vercel (our hosting provider)
                collects standard server logs and anonymized analytics including page views and referral sources. We
                do not use advertising trackers.
              </li>
              <li>
                <strong className="text-[var(--text)]">Session storage</strong> — our chat widget uses
                sessionStorage to remember whether you have interacted with it during your current browser session.
                This data is not transmitted to any server and is cleared when you close the tab.
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-[var(--text-secondary)] leading-relaxed">
              <li>To respond to your inquiries and schedule consultations</li>
              <li>To provide business formation, licensing, tax, insurance, and related services</li>
              <li>To prepare and file documents on your behalf with government agencies</li>
              <li>To communicate with you about your case or ongoing services</li>
              <li>To send follow-up information or updates relevant to your services</li>
              <li>To comply with our legal and professional obligations</li>
            </ul>
            <p className="text-[var(--text-secondary)] mt-4 leading-relaxed">
              We do not sell your personal information. We do not use your information for advertising purposes or
              share it with marketing third parties.
            </p>
          </div>

          {/* Section 4 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">4. Third-Party Services</h2>
            <ul className="list-disc pl-6 space-y-2 text-[var(--text-secondary)] leading-relaxed">
              <li>
                <strong className="text-[var(--text)]">JotForm</strong> — we embed JotForm forms to collect service
                intake information. Data submitted through JotForm is stored on JotForm&apos;s platform and is subject
                to{" "}
                <a
                  href="https://www.jotform.com/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--blue-accent)] underline underline-offset-2"
                >
                  JotForm&apos;s Privacy Policy
                </a>
                . JotForm is HIPAA-eligible and uses HTTPS encryption.
              </li>
              <li>
                <strong className="text-[var(--text)]">Vercel</strong> — our website is hosted on Vercel, which
                processes server requests and may log standard access data (IP address, browser type, pages visited)
                for security and performance purposes. See{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--blue-accent)] underline underline-offset-2"
                >
                  Vercel&apos;s Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong className="text-[var(--text)]">Email delivery</strong> — inquiries submitted through our
                contact form are delivered to our team via email service providers. These providers process messages
                in transit only.
              </li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">5. Sensitive Information</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Some services require us to handle sensitive information including tax identification numbers,
              financial records, and immigration documents. We take this seriously:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[var(--text-secondary)] leading-relaxed mt-4">
              <li>Sensitive data is collected only through encrypted, HTTPS-secured forms</li>
              <li>
                Access is restricted to the specific team member handling your case
              </li>
              <li>
                We do not share your sensitive documents with third parties except as required to deliver your
                service (e.g., filing with the IRS, USCIS, or New York State agencies)
              </li>
              <li>
                Physical documents provided in-office are stored securely and returned or destroyed upon completion
                of your case
              </li>
            </ul>
          </div>

          {/* Section 6 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">6. Data Retention</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              We retain your information for as long as necessary to provide services and meet legal requirements.
              For tax-related records, the IRS generally requires practitioners to retain records for a minimum of{" "}
              <strong className="text-[var(--text)]">seven (7) years</strong>. Business formation and licensing
              records are retained for the duration of the client relationship and thereafter as required by New
              York State law.
            </p>
            <p className="text-[var(--text-secondary)] mt-4 leading-relaxed">
              If you request deletion of your information, we will remove what we are legally permitted to remove
              and inform you of any records we are required to retain.
            </p>
          </div>

          {/* Section 7 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">7. Your Rights</h2>
            <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[var(--text-secondary)] leading-relaxed">
              <li>Request access to the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information (subject to legal retention requirements)</li>
              <li>Withdraw consent to future communications at any time</li>
            </ul>
            <p className="text-[var(--text-secondary)] mt-4 leading-relaxed">
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:info@advantagenys.com"
                className="text-[var(--blue-accent)] underline underline-offset-2"
              >
                info@advantagenys.com
              </a>
              . We will respond within 30 days.
            </p>
          </div>

          {/* Section 8 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">8. Security</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Our website is served exclusively over HTTPS. Form submissions are encrypted in transit. Access to
              client files is limited to authorized staff. While we take reasonable steps to protect your
              information, no method of transmission over the internet is completely secure. If you have concerns
              about sharing sensitive information online, please contact us by phone or visit our office.
            </p>
          </div>

          {/* Section 9 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">9. Children&apos;s Privacy</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Our website and services are not directed at individuals under 13 years of age. We do not knowingly
              collect personal information from children. If you believe a child has submitted information through
              our site, please contact us and we will delete it promptly.
            </p>
          </div>

          {/* Section 10 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">10. Changes to This Policy</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              We may update this Privacy Policy from time to time. When we do, we will update the &ldquo;Last
              updated&rdquo; date at the top of this page. Continued use of our website or services after a change
              constitutes acceptance of the updated policy. We encourage you to review this page periodically.
            </p>
          </div>

          {/* Section 11 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">11. Contact Us</h2>
            <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">
              If you have questions about this Privacy Policy or how your information is handled, please contact us:
            </p>
            <address className="not-italic space-y-1 text-[var(--text-secondary)]">
              <p className="font-semibold text-[var(--text)]">Advantage Business Consulting LLC</p>
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
                <a href="tel:+19292929230" className="text-[var(--blue-accent)] underline underline-offset-2">
                  (929) 292-9230
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
              <p>Hours: Monday – Saturday, 9:00 AM – 7:00 PM ET</p>
            </address>
          </div>
        </div>
      </Container>
    </section>
  );
}
