"use client";

import { useState } from "react";
import { categories, type CategoryKey, type FormConfig, categoryColors, getFormsByCategory } from "@/lib/forms";
import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import Link from "next/link";

export function CategoryTabs() {
  const [active, setActive] = useState<CategoryKey>("all");
  const filtered = getFormsByCategory(active);

  return (
    <>
      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActive(cat.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-[var(--transition)] cursor-pointer ${
              active === cat.key
                ? "bg-[var(--blue-accent)] text-white shadow-[var(--shadow-md)]"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--blue-pale)] hover:text-[var(--blue-accent)]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Forms grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((form, i) => (
          <ScrollReveal key={form.id} delay={i * 60}>
            <FormCard form={form} />
          </ScrollReveal>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-[var(--text-muted)] py-12">
          No forms available in this category.
        </p>
      )}
    </>
  );
}

function FormCard({ form }: { form: FormConfig }) {
  const colorClass = categoryColors[form.category];
  const categoryLabel = categories.find((c) => c.key === form.category)?.label || form.category;

  return (
    <Card hover className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
          {categoryLabel}
        </span>
        {form.encrypted && (
          <span className="inline-flex items-center px-2 py-1 text-[10px] font-medium rounded-full bg-green-50 text-green-700">
            Encrypted
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold text-[var(--text)] mb-2">{form.title}</h3>
      <p className="text-sm text-[var(--text-secondary)] mb-5 flex-1">{form.description}</p>
      <Link
        href={`/resources/forms/${form.slug}`}
        className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-semibold rounded-[var(--radius)] bg-[var(--blue-accent)] text-white hover:opacity-90 transition-all duration-[var(--transition)]"
      >
        Open Form
      </Link>
    </Card>
  );
}
