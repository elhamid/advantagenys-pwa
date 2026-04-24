"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ContactForm } from "./ContactForm";
import { BookingForm } from "./BookingForm";

const tabs = [
  { id: "message", label: "Send Message" },
  { id: "booking", label: "Book Appointment" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function resolveInitialTab(param: string | null): TabId {
  if (param === "booking") return "booking";
  return "message";
}

export function ContactFormTabs() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>(() =>
    resolveInitialTab(searchParams.get("tab")),
  );

  return (
    <div>
      {/* Tab Toggle */}
      <div className="flex rounded-[var(--radius-lg)] bg-[var(--surface)] border border-[var(--border)] p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-[var(--radius)] transition-all duration-[var(--transition)] cursor-pointer ${
              activeTab === tab.id
                ? "bg-[var(--blue-accent)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Form */}
      {activeTab === "message" ? <ContactForm /> : <BookingForm />}
    </div>
  );
}
