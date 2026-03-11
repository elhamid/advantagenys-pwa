"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { FormConfig } from "@/lib/forms";
import { categories, categoryColors } from "@/lib/forms";
import { Card } from "@/components/ui/Card";
import { ShareButton } from "./ShareButton";
import { categoryIcons } from "./categoryIcons";

interface FormCardProps {
  form: FormConfig;
  index?: number;
  kioskMode?: boolean;
}

export function FormCard({ form, index = 0, kioskMode = false }: FormCardProps) {
  const colorClass = categoryColors[form.category];
  const categoryLabel = categories.find((c) => c.key === form.category)?.label || form.category;
  const isLink = form.type === "link";
  const formUrl = isLink ? (form.linkUrl || "#") : `/resources/forms/${form.slug}`;
  const shareUrl = isLink ? (form.linkUrl || "#") : `/resources/forms/${form.slug}`;
  const Icon = categoryIcons[form.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 30, delay: index * 0.04 }}
    >
      <Card hover className={`flex flex-col h-full ${kioskMode ? "p-5" : ""}`}>
        <div className="flex items-start gap-3 mb-3">
          {/* Category icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-[var(--radius)] flex items-center justify-center ${colorClass}`}>
            <Icon />
          </div>
          <div className="flex-1 min-w-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${colorClass}`}>
              {categoryLabel}
            </span>
            <h3 className={`font-bold text-[var(--text)] mt-1 leading-snug ${kioskMode ? "text-base" : "text-sm sm:text-base"}`}>
              {form.title}
            </h3>
          </div>
          {/* Copy link button */}
          <ShareButton title={form.title} url={shareUrl} variant="copy" />
        </div>

        {!kioskMode && (
          <p className="text-sm text-[var(--text-secondary)] mb-4 flex-1 line-clamp-2">
            {form.description}
          </p>
        )}

        {/* Actions */}
        <div className={`flex gap-2 ${kioskMode ? "mt-2" : "mt-auto"}`}>
          {isLink ? (
            <a
              href={formUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 inline-flex items-center justify-center gap-1.5 font-semibold rounded-[var(--radius)] bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--blue-pale)] hover:text-[var(--blue-accent)] transition-all duration-[var(--transition)] ${kioskMode ? "px-4 py-3 text-sm" : "px-3 py-2.5 text-sm"}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Open
            </a>
          ) : (
            <Link
              href={formUrl}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 font-semibold rounded-[var(--radius)] bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--blue-pale)] hover:text-[var(--blue-accent)] transition-all duration-[var(--transition)] ${kioskMode ? "px-4 py-3 text-sm" : "px-3 py-2.5 text-sm"}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Open
            </Link>
          )}
          <ShareButton title={form.title} url={shareUrl} variant="icon" />
          <ShareButton title={form.title} url={shareUrl} variant="whatsapp" className={kioskMode ? "" : "hidden sm:inline-flex"} />
        </div>
      </Card>
    </motion.div>
  );
}
