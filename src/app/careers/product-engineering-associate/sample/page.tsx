import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import {
  CAREERS_ROLE_PATH,
  deriveVerificationCode,
} from "@/lib/careers/product-engineering-associate";
import { SampleQuoteFlow } from "./SampleQuoteFlow";

export const metadata: Metadata = {
  title: "Product Review Sample",
  description: "Sanitized recruiting exercise for Advantage product-engineering candidates.",
  robots: {
    index: false,
    follow: false,
  },
};

interface SamplePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function ProductEngineeringAssociateSamplePage({
  searchParams,
}: SamplePageProps) {
  const params = await searchParams;
  const ref = firstParam(params.ref) ?? firstParam(params.partner);
  const verificationCode = deriveVerificationCode(ref);

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <Container className="py-10 lg:py-14">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex rounded-full border border-[var(--border)] bg-[var(--blue-bg)] px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[var(--deep-blue)]">
              Sanitized recruiting exercise — not a client deliverable
            </div>
            <h1 className="text-3xl font-bold leading-tight text-[var(--text)] sm:text-5xl">
              Local service quote flow
            </h1>
            <p className="mt-5 text-base leading-7 text-[var(--text-secondary)]">
              This page is a sanitized recruiting exercise. It is not a real Advantage customer and
              does not describe a real client deliverable. Use the mini flow below to show how you
              inspect a product surface, explain what is wrong, and decide what to fix first.
            </p>

            <div className="mt-6 border-l-4 border-[var(--teal)] bg-[var(--teal-bg)] px-4 py-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--deep-blue)]">
                The scenario
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text)]">
                A small business owner lands on a service page, chooses licensing help, enters
                contact details, and expects a WhatsApp follow-up. Run the flow below on{" "}
                <strong>both a phone and a desktop</strong>, complete it end to end, and find what
                is wrong. We are not telling you how many issues exist or where they are.
              </p>
            </div>

            <div className="mt-5 border border-[var(--border)] bg-[var(--bg)] px-4 py-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                Verification code
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Include this code in your submission so we can match it to your invitation:
              </p>
              <p className="mt-2 text-2xl font-black tracking-[0.12em] text-[var(--text)]">
                {verificationCode}
              </p>
            </div>

            <a
              href={CAREERS_ROLE_PATH}
              className="mt-6 inline-flex min-h-11 items-center bg-[var(--blue-accent)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--blue-vibrant)]"
            >
              Back to application
            </a>
          </div>
        </Container>
      </section>

      <Container className="py-8">
        <div className="mb-4 max-w-3xl">
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            The widget below is interactive. Tap through it, complete a submission, and read every
            screen carefully on each device width. Capture annotated screenshots as you go — your
            application will ask for proof.
          </p>
        </div>
        <SampleQuoteFlow />
      </Container>
    </main>
  );
}
