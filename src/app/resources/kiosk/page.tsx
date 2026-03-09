import type { Metadata } from "next";
import { FormsGrid } from "@/components/resources/FormsGrid";

export const metadata: Metadata = {
  title: "Forms Kiosk",
  description: "Quick-access forms kiosk for staff use.",
  robots: { index: false, follow: false },
};

export default function KioskPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-6 sm:px-6 sm:py-8">
      {/* Minimal header */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">
          Forms
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Tap share to send a form link to a customer
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto">
        <FormsGrid kioskMode />
      </div>
    </div>
  );
}
