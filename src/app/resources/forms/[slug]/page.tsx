import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { forms, getFormBySlug } from "@/lib/forms";
import { FormEmbed } from "./FormEmbed";
import { NativeForm } from "./NativeForm";
import { FormPageShareBar } from "./FormPageShareBar";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return forms.filter((f) => f.active && f.type !== "link").map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const form = getFormBySlug(slug);
  if (!form) return { title: "Form Not Found" };

  return {
    title: form.title,
    description: form.description,
  };
}

export default async function FormPage({ params }: PageProps) {
  const { slug } = await params;
  const form = getFormBySlug(slug);

  if (!form || form.type === "link" || (!form.embedUrl && form.platform !== "native")) {
    notFound();
  }

  return (
    <div className="bg-[var(--bg)] min-h-screen">
      <section className="pt-24 pb-8">
        <Container>
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--blue-accent)] transition-colors duration-[var(--transition)] mb-6"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Resources
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-2">
                {form.title}
              </h1>
              <p className="text-lg text-[var(--text-secondary)]">
                {form.description}
              </p>
              {form.encrypted && (
                <p className="mt-2 text-sm text-green-700 font-medium">
                  This form uses encrypted submission for your security.
                </p>
              )}
            </div>

            <FormPageShareBar title={form.title} slug={form.slug} />
          </div>
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          {form.platform === "native" && form.nativeComponent ? (
            <NativeForm componentName={form.nativeComponent} />
          ) : (
            <FormEmbed form={form} />
          )}
        </Container>
      </section>
    </div>
  );
}
