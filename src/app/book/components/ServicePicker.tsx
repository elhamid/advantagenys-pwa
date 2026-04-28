"use client";

import { motion } from "framer-motion";

export interface ServiceOption {
  slug: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

// Inline SVG icons — no external icon dependency
function TaxIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="4" y="3" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="21" cy="21" r="4" fill="var(--blue-accent)" stroke="var(--surface)" strokeWidth="1.5" />
      <path d="M19.5 21h3M21 19.5v3" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ITINIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="9" r="4.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 23c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M20 4l1.5 1.5L24 3" stroke="var(--blue-accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FormationIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="3" y="12" width="8" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="10" y="7" width="8" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="17" y="10" width="8" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function InsuranceIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 3L5 7v7c0 5.5 3.9 10.7 9 12 5.1-1.3 9-6.5 9-12V7L14 3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M10 14l3 3 5-5" stroke="var(--blue-accent)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AuditIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="13" cy="13" r="8" stroke="currentColor" strokeWidth="1.7" />
      <path d="M19 19l4 4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M10 13l2.5 2.5L16 10" stroke="var(--blue-accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ConsultingIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M4 6h20v13a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 6a2 2 0 012-2h16a2 2 0 012 2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M11 24h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M14 21v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9 12h10M9 15.5h6" stroke="var(--blue-accent)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export const SERVICES: ServiceOption[] = [
  {
    slug: "tax",
    label: "Tax Services",
    description: "Personal & business returns, IRS response, self-employed",
    icon: <TaxIcon />,
  },
  {
    slug: "itin",
    label: "ITIN / Tax ID",
    description: "IRS Certified Agent — W-7 application, renewals, dependents",
    icon: <ITINIcon />,
  },
  {
    slug: "formation",
    label: "Business Formation",
    description: "LLC, Corporation, DBA — filed same week",
    icon: <FormationIcon />,
  },
  {
    slug: "insurance",
    label: "Insurance",
    description: "General liability, workers' comp, commercial auto",
    icon: <InsuranceIcon />,
  },
  {
    slug: "audit",
    label: "Audit Defense",
    description: "IRS & state audit representation, penalty abatement",
    icon: <AuditIcon />,
  },
  {
    slug: "consulting",
    label: "Business Consulting",
    description: "Licensing, permits, contracts, strategic guidance",
    icon: <ConsultingIcon />,
  },
];

interface ServicePickerProps {
  selected: string | null;
  onSelect: (slug: string) => void;
}

export function ServicePicker({ selected, onSelect }: ServicePickerProps) {
  return (
    <div>
      <p className="text-sm font-medium text-[var(--text-secondary)] mb-4">
        Select the service you need — we will match you with the right specialist.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SERVICES.map((svc, i) => {
          const active = selected === svc.slug;
          return (
            <motion.button
              key={svc.slug}
              type="button"
              onClick={() => onSelect(svc.slug)}
              aria-pressed={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
              className={`group relative flex flex-col gap-3 rounded-[var(--radius-lg)] border-2 p-4 text-left transition-all cursor-pointer ${
                active
                  ? "border-[var(--blue-accent)] bg-[var(--blue-pale)] shadow-[0_0_0_4px_rgba(79,86,232,0.12)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--blue-accent)]/50 hover:shadow-[var(--shadow-md)]"
              }`}
            >
              {/* Icon container */}
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-[var(--radius)] transition-colors ${
                  active
                    ? "bg-[var(--blue-accent)] text-white"
                    : "bg-[var(--bg-section)] text-[var(--navy)] group-hover:bg-[var(--blue-pale)] group-hover:text-[var(--blue-accent)]"
                }`}
              >
                {svc.icon}
              </span>

              <div className="flex-1 min-w-0">
                <span
                  className={`block text-sm font-bold leading-tight mb-1 ${
                    active ? "text-[var(--blue-accent)]" : "text-[var(--text)]"
                  }`}
                >
                  {svc.label}
                </span>
                <span className="block text-xs text-[var(--text-muted)] leading-snug line-clamp-2">
                  {svc.description}
                </span>
              </div>

              {/* Selected checkmark */}
              {active && (
                <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--blue-accent)]">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                    <path d="M2 5.5l2.5 2.5L9 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
