import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import {
  CAREERS_ROLE_PATH,
  CAREERS_ROLE_TITLE,
  WORK_SAMPLE_URL,
} from "@/lib/careers/product-engineering-associate";
import { ProductEngineeringAssociateForm } from "./ProductEngineeringAssociateForm";

export const metadata: Metadata = {
  title: CAREERS_ROLE_TITLE,
  description:
    "Open application for a junior product engineering associate role supporting Advantage web products, forms, dashboards, and user-flow testing.",
  alternates: { canonical: CAREERS_ROLE_PATH },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProductEngineeringAssociatePage() {
  return (
    <main className="bg-[var(--bg)]">
      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <Container className="grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex rounded-full border border-[var(--border)] bg-[var(--blue-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--deep-blue)]">
              Partner referral intake
            </div>
            <h1 className="text-3xl font-bold leading-tight text-[var(--text)] sm:text-5xl">
              {CAREERS_ROLE_TITLE}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
              Advantage is looking for two careful junior-to-mid technical associates in
              India who can support real product work: web pages, forms, dashboards,
              issue reports, screenshots, small frontend/content fixes, and complete
              user-flow testing.
            </p>
            <a
              href="#application"
              className="mt-6 inline-flex min-h-11 items-center gap-2 bg-[var(--blue-accent)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--blue-vibrant)]"
            >
              Start application
            </a>
            <div className="mt-8 grid gap-3 text-sm text-[var(--text)] sm:grid-cols-3">
              <div className="border-l-4 border-[var(--teal)] bg-[var(--teal-bg)] px-4 py-3">
                <strong className="block">AI allowed</strong>
                <span className="text-[var(--text-secondary)]">Proof still matters.</span>
              </div>
              <div className="border-l-4 border-[var(--gold)] bg-[#fff7ed] px-4 py-3">
                <strong className="block">Not a senior role</strong>
                <span className="text-[var(--text-secondary)]">Careful execution first.</span>
              </div>
              <div className="border-l-4 border-[var(--blue-accent)] bg-[var(--blue-bg)] px-4 py-3">
                <strong className="block">Work sample inside</strong>
                <span className="text-[var(--text-secondary)]">Show what you checked.</span>
              </div>
            </div>
          </div>

          <aside className="self-start border border-[var(--border)] bg-[var(--bg)] p-5 shadow-[var(--shadow-sm)]">
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
              What this role is
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
              <li>Testing mobile and desktop product flows with screenshots.</li>
              <li>Finding where forms, dashboards, APIs, or content break down.</li>
              <li>Making small safe improvements when the direction is clear.</li>
              <li>Escalating uncertainty before risky product changes.</li>
            </ul>
            <div className="mt-5 border-t border-[var(--border)] pt-5 text-sm text-[var(--text-secondary)]">
              <strong className="block text-[var(--text)]">Fictional work sample page</strong>
              <a
                href={WORK_SAMPLE_URL}
                className="mt-1 inline-block break-all font-medium text-[var(--blue-accent)] underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {WORK_SAMPLE_URL}
              </a>
            </div>
          </aside>
        </Container>
      </section>

      <section id="application" className="scroll-mt-20 py-10 lg:py-14">
        <Container className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="hidden lg:block">
            <div className="sticky top-24 border-l border-[var(--border)] pl-5 text-sm text-[var(--text-secondary)]">
              <div className="font-semibold text-[var(--text)]">Review order</div>
              <ol className="mt-3 space-y-2">
                <li>Identity and referral</li>
                <li>Resume or profile link</li>
                <li>Compensation in INR or USD</li>
                <li>Mini product review</li>
                <li>AI/tool usage disclosure</li>
              </ol>
            </div>
          </div>

          <Suspense fallback={<div className="min-h-[480px] border border-[var(--border)] bg-[var(--surface)]" />}>
            <ProductEngineeringAssociateForm />
          </Suspense>
        </Container>
      </section>
    </main>
  );
}
