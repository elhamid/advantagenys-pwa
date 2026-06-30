"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { categories, type CategoryKey, type FormConfig, getFormsByCategory } from "@/lib/forms";
import { FormCard } from "./FormCard";
import { ShareButton } from "./ShareButton";

interface FormsGridProps {
  kioskMode?: boolean;
}

function UtilityLinkRow({ item }: { item: FormConfig }) {
  if (!item.linkUrl) return null;

  return (
    <div className="flex items-center gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--text)]">{item.title}</p>
        <p className="truncate text-xs text-[var(--text-muted)]">{item.description}</p>
      </div>
      <a
        href={item.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] transition-colors hover:bg-[var(--blue-pale)] hover:text-[var(--blue-accent)]"
      >
        Open
      </a>
      <ShareButton title={item.title} url={item.linkUrl} variant="copy" className="p-1.5" />
    </div>
  );
}

export function FormsGrid({ kioskMode = false }: FormsGridProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let results = getFormsByCategory(activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q)
      );
    }
    return results;
  }, [activeCategory, search]);

  const serviceForms = filtered.filter((form) => form.type !== "link");
  const utilityLinks = filtered.filter((form) => form.type === "link");

  const gridClass = `grid gap-4 ${kioskMode ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"}`;

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-6">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search forms & links..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full pl-11 pr-4 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-accent)] focus:border-transparent transition-all duration-[var(--transition)] ${kioskMode ? "py-4 text-base" : "py-3 text-sm"}`}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Category filter tabs */}
      <div className={`flex flex-wrap gap-2 ${kioskMode ? "mb-8" : "mb-6"}`}>
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-2 font-semibold rounded-full transition-all duration-[var(--transition)] cursor-pointer ${kioskMode ? "text-sm" : "text-xs sm:text-sm"} ${
              activeCategory === cat.key
                ? "bg-[var(--blue-accent)] text-white shadow-[var(--shadow-md)]"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--blue-pale)] hover:text-[var(--blue-accent)]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className={`text-[var(--text-muted)] mb-4 ${kioskMode ? "text-sm" : "text-xs"}`}>
        {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        {search && ` matching "${search}"`}
      </p>

      {/* Primary grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeCategory}-${search}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={gridClass}
        >
          {serviceForms.map((form, i) => (
            <FormCard key={form.id} form={form} index={i} kioskMode={kioskMode} />
          ))}
        </motion.div>
      </AnimatePresence>

      {utilityLinks.length > 0 && (
        <section className={serviceForms.length > 0 ? "mt-8" : ""} aria-label="Quick links">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <p className="text-xs font-semibold uppercase text-[var(--text-muted)]">Quick links</p>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {utilityLinks.map((item) => (
              <UtilityLinkRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[var(--text-muted)] text-lg">No forms found.</p>
          <button
            onClick={() => {
              setSearch("");
              setActiveCategory("all");
            }}
            className="mt-3 text-sm font-medium text-[var(--blue-accent)] hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
