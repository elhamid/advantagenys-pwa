import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CAREERS_ROLE_PATH } from "@/lib/careers/product-engineering-associate";

export const metadata: Metadata = {
  title: "Product Review Sample",
  description: "Fictional product-review sample for Advantage recruiting candidates.",
  robots: {
    index: false,
    follow: false,
  },
};

const issues = [
  {
    title: "Mobile quote form loses context",
    detail:
      "On a 390px phone viewport, the service cards push the quote form below the fold and the selected service is not repeated near the submit button.",
  },
  {
    title: "Partner code is easy to miss",
    detail:
      "The referral field is prefilled but styled the same as optional fields, so a candidate may overwrite or ignore the partner attribution.",
  },
  {
    title: "Success state has no next action",
    detail:
      "After submit, the page confirms receipt but does not tell the user whether to expect email, WhatsApp, or no follow-up unless selected.",
  },
  {
    title: "Desktop proof links can overflow",
    detail:
      "Long Google Drive links in the proof field need wrapping rules so they do not widen the form on narrow laptop widths.",
  },
];

export default function ProductEngineeringAssociateSamplePage() {
  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <Container className="py-10 lg:py-14">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex rounded-full border border-[var(--border)] bg-[var(--blue-bg)] px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[var(--deep-blue)]">
              Fictional sample
            </div>
            <h1 className="text-3xl font-bold leading-tight text-[var(--text)] sm:text-5xl">
              Mini product review packet
            </h1>
            <p className="mt-5 text-base leading-7 text-[var(--text-secondary)]">
              This page is a sanitized recruiting exercise. It is not a client deliverable and
              does not describe a real Advantage customer. Use it to show how you inspect a page,
              explain issues, and decide what to fix first.
            </p>
            <a
              href={CAREERS_ROLE_PATH}
              className="mt-6 inline-flex min-h-11 items-center bg-[var(--blue-accent)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--blue-vibrant)]"
            >
              Back to application
            </a>
          </div>
        </Container>
      </section>

      <Container className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
            <span aria-hidden="true">Mobile + desktop</span>
            Product surface
          </div>
          <h2 className="mt-3 text-2xl font-bold text-[var(--text)]">Local service quote flow</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Imagine a small business owner lands on a service page, chooses licensing help,
            enters contact details, and expects a WhatsApp follow-up. Your review should cover
            mobile and desktop, copy clarity, form confidence, and proof that the submit path is
            understandable to a non-technical user.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {issues.map((issue) => (
              <article key={issue.title} className="border border-[var(--border)] bg-[var(--bg)] p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-4 w-4 flex-none items-center justify-center rounded-full bg-[var(--gold)] text-[10px] font-black text-white" aria-hidden="true">
                    !
                  </span>
                  <div>
                    <h3 className="font-bold text-[var(--text)]">{issue.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{issue.detail}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
            <span aria-hidden="true">Checklist</span>
            What to submit
          </div>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
            <li>List five issues or improvements you noticed.</li>
            <li>Write reproduction steps for the most important issue.</li>
            <li>Explain which issue you would fix first and why.</li>
            <li>Name one small improvement you would make safely.</li>
            <li>Ask one question before changing anything risky.</li>
          </ol>
        </aside>
      </Container>
    </main>
  );
}
