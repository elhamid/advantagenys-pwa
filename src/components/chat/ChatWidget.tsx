"use client";

import { useState } from "react";
import { PHONE } from "@/lib/constants";

export function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="fixed z-40"
      style={{
        right: "calc(1.5rem + env(safe-area-inset-right))",
        bottom: "calc(1.5rem + env(safe-area-inset-bottom))",
      }}
    >
      {open && (
        <div className="mb-4 w-80 rounded-[var(--radius-lg)] bg-[var(--surface)] shadow-[var(--shadow-lg)] border border-[var(--border)] overflow-hidden">
          <div className="p-4" style={{ background: "var(--gradient-primary)" }}>
            <h3 className="text-white font-semibold">Human help now. AI next.</h3>
            <p className="text-sm text-slate-200">
              This is where the future AI assistant will live. For now, reach the
              team directly.
            </p>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <a
              href={PHONE.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 p-3 rounded-[var(--radius)] bg-green-50 text-[var(--green)] font-medium text-sm hover:bg-green-100 transition-colors"
            >
              <span className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 2C6.478 2 2 6.478 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.522 0 10-4.478 10-10S17.522 2 12 2zm0 18a7.96 7.96 0 01-4.11-1.14l-.29-.174-3.01.79.81-2.95-.19-.3A7.96 7.96 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
                WhatsApp
              </span>
              <span className="text-xs font-semibold text-emerald-700">
                {PHONE.whatsapp}
              </span>
            </a>
            <a
              href={`tel:${PHONE.mainTel}`}
              className="flex items-center gap-3 p-3 rounded-[var(--radius)] bg-[var(--blue-bg)] text-[var(--blue-accent)] font-medium text-sm hover:bg-[var(--blue-pale)] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              </svg>
              Call {PHONE.main}
            </a>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full shadow-[var(--shadow-lg)] flex items-center justify-center text-white transition-transform hover:scale-105"
        style={{ background: "var(--blue-accent)" }}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
      </button>
      {!open && (
        <div className="pointer-events-none mt-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          AI assistant soon
        </div>
      )}
    </div>
  );
}
