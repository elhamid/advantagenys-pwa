import type { Metadata } from "next";
import Link from "next/link";
import { SERVICES } from "../components/ServicePicker";

export const metadata: Metadata = {
  title: "Booking Confirmed — Advantage Business Consulting",
  description: "Your appointment request has been received.",
  robots: { index: false },
};

interface Props {
  searchParams: Promise<{
    id?: string;
    service?: string;
    mode?: string;
  }>;
}

function getServiceLabel(slug: string | undefined): string {
  if (!slug) return "consult";
  const match = SERVICES.find((s) => s.slug === slug.toLowerCase());
  return match ? match.label : slug;
}

export default async function BookConfirmedPage({ searchParams }: Props) {
  const params = await searchParams;
  const confirmationId = params.id;
  const serviceSlug = params.service;
  const mode = params.mode;
  const isInert = mode === "inert";
  const serviceLabel = getServiceLabel(serviceSlug);

  return (
    <main id="main" className="min-h-screen bg-[var(--bg)] flex items-start justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-[var(--radius-xl)] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-lg)] p-8 text-center">
          {/* Success mark */}
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: isInert ? "var(--teal-bg)" : "rgba(79,86,232,0.1)" }}
          >
            {isInert ? (
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M5 14l5 5 13-13" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M5 14l5 5 13-13" stroke="var(--blue-accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>

          {isInert ? (
            <>
              <h1 className="text-2xl font-bold text-[var(--text)] mb-3">
                Got it — we&apos;ll be in touch
              </h1>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                Your <strong>{serviceLabel}</strong> consult request has been received. We will reach out within 24 hours to confirm your appointment time.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[var(--text)] mb-3">
                You&apos;re booked.
              </h1>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-2">
                Confirmation sent to your email with a calendar invite.
              </p>
              {confirmationId && (
                <p className="text-xs text-[var(--text-muted)] mb-6">
                  Appointment ID:{" "}
                  <code className="font-mono bg-[var(--bg-section)] rounded px-1.5 py-0.5">
                    {confirmationId}
                  </code>
                </p>
              )}
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Need to reschedule? Reply to your confirmation email or call{" "}
                <a href="tel:+19299331396" className="text-[var(--blue-accent)] font-medium hover:underline underline-offset-2">
                  (929) 933-1396
                </a>
                .
              </p>
            </>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-[var(--radius-lg)] bg-[var(--blue-accent)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
            >
              Back to Home
            </Link>
            <a
              href="https://wa.me/19299331396"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--bg-section)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M13.6 2.4A7.83 7.83 0 008 0C3.6 0 0 3.6 0 8c0 1.4.37 2.77 1.07 3.98L0 16l4.13-1.08A7.98 7.98 0 008 16c4.4 0 8-3.6 8-8 0-2.13-.83-4.14-2.4-5.6zm-5.6 12.27a6.62 6.62 0 01-3.38-.93l-.24-.14-2.46.64.66-2.4-.16-.25A6.6 6.6 0 011.4 8C1.4 4.37 4.37 1.4 8 1.4c1.76 0 3.4.68 4.64 1.93A6.53 6.53 0 0114.6 8c0 3.63-2.97 6.67-6.6 6.67zm3.63-4.97c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.44.1-.13.2-.5.64-.62.77-.11.13-.23.15-.43.05-.2-.1-.84-.31-1.6-.99-.59-.52-.99-1.17-1.1-1.37-.12-.2-.01-.31.09-.41.09-.09.2-.24.3-.36.1-.12.13-.2.2-.33.06-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.45-.16-.38-.32-.33-.44-.34H5.3c-.13 0-.34.05-.52.24-.18.2-.68.67-.68 1.63 0 .96.7 1.89.8 2.02.1.13 1.38 2.1 3.34 2.95.47.2.83.32 1.12.41.47.15.9.13 1.24.08.38-.06 1.17-.48 1.33-.94.17-.46.17-.86.12-.94-.05-.08-.18-.13-.38-.23z" fill="#25D366" />
              </svg>
              WhatsApp Us
            </a>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
          Questions? Email{" "}
          <a href="mailto:info@advantagenys.com" className="text-[var(--blue-accent)] hover:underline underline-offset-2">
            info@advantagenys.com
          </a>
        </p>
      </div>
    </main>
  );
}
