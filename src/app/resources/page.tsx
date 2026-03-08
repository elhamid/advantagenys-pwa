import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CategoryTabs } from "@/components/resources/CategoryTabs";

export const metadata: Metadata = {
  title: "Client Resources",
  description:
    "Access all forms and documents you need for your business services. Tax filing, business formation, immigration, licensing, and more.",
};

export default function ResourcesPage() {
  return (
    <div className="bg-[var(--bg)] min-h-screen">
      {/* Hero */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-[var(--blue-bg)] to-[var(--bg)]">
        <Container>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">
            Client Resources
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl">
            Access all forms and documents you need for your business services.
            Find the right form, fill it out online, and submit securely.
          </p>
        </Container>
      </section>

      {/* Forms */}
      <section className="py-12 pb-24">
        <Container>
          <CategoryTabs />
        </Container>
      </section>
    </div>
  );
}
