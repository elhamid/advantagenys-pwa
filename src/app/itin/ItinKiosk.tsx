"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ItinForm } from "./ItinForm";

const AUTO_RESET_MS = 30_000; // 30 sec after submit → reset to welcome

type Stage = "welcome" | "form" | "success";

export function ItinKiosk() {
  const [stage, setStage] = useState<Stage>("welcome");
  const [fadeIn, setFadeIn] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fade-in on mount
  useEffect(() => {
    requestAnimationFrame(() => setFadeIn(true));
  }, []);

  // Auto-reset after success
  useEffect(() => {
    if (stage === "success") {
      resetTimerRef.current = setTimeout(() => {
        resetToWelcome();
      }, AUTO_RESET_MS);
    }
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const resetToWelcome = useCallback(() => {
    setStage("welcome");
    setShowConfirm(false);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
  }, []);

  const handleStartOver = useCallback(() => {
    if (stage === "form") {
      setShowConfirm(true);
    } else {
      resetToWelcome();
    }
  }, [stage, resetToWelcome]);

  const startForm = useCallback(() => {
    setStage("form");
  }, []);

  return (
    <div
      className={`
        min-h-screen min-h-[100dvh] flex flex-col
        bg-gradient-to-br from-[#0F1B2D] via-[#1A3A5C] to-[#0F1B2D]
        text-white overflow-hidden relative
        transition-opacity duration-700
        ${fadeIn ? "opacity-100" : "opacity-0"}
      `}
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(79,86,232,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(79,86,232,0.06) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 70%)
          `,
        }}
      />

      {/* Top bar — always visible, minimal */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 sm:px-8 sm:py-5">
        <div className="flex items-center gap-3">
          <Image
            src="/icons/icon-192.png"
            alt="Advantage Services"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <span className="text-sm font-semibold tracking-wide text-white/70">
            Advantage Services
          </span>
        </div>
        {stage !== "welcome" && (
          <button
            onClick={handleStartOver}
            className="
              text-xs font-medium px-4 py-2 rounded-full
              bg-white/10 text-white/60 backdrop-blur-sm
              hover:bg-white/15 hover:text-white/80
              active:scale-95 transition-all duration-200
            "
          >
            Start Over
          </button>
        )}
      </header>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {stage === "welcome" && <WelcomeScreen onStart={startForm} />}
        {stage === "form" && <ItinForm onSuccess={() => setStage("success")} />}
        {stage === "success" && <SuccessScreen onReset={resetToWelcome} />}
      </div>

      {/* Start Over confirmation overlay */}
      {showConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-6 w-full max-w-sm rounded-2xl bg-[#1A2D45] border border-white/10 p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white text-center mb-3">
              Start Over?
            </h3>
            <p className="text-white/50 text-sm text-center mb-8 leading-relaxed">
              All progress will be lost. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="
                  flex-1 py-3 rounded-xl
                  bg-white/10 text-white/70 font-semibold text-base
                  hover:bg-white/15 hover:text-white/90 active:scale-[0.97]
                  transition-all duration-200
                "
              >
                Cancel
              </button>
              <button
                onClick={resetToWelcome}
                className="
                  flex-1 py-3 rounded-xl
                  bg-red-500/80 text-white font-semibold text-base
                  hover:bg-red-500 active:scale-[0.97]
                  transition-all duration-200
                "
              >
                Yes, Start Over
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Welcome Screen ─── */
function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`
        flex-1 flex flex-col items-center justify-center px-6 pb-12
        transition-all duration-700 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
    >
      {/* Tropical Stars branding */}
      <div className="mb-6 flex flex-col items-center">
        <Image
          src="/images/tropical-stars-logo.png"
          alt="Tropical Stars"
          width={192}
          height={90}
          priority
        />
      </div>

      {/* IRS badge */}
      <div className="mb-6">
        <span
          className="
            inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full
            bg-[#4F56E8]/20 border border-[#4F56E8]/30
            text-[#818CF8] text-base font-semibold tracking-wide
          "
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          IRS Certified Acceptance Agent
        </span>
      </div>

      {/* Title */}
      <h1
        className="
          text-4xl sm:text-5xl md:text-6xl font-bold text-center
          leading-[1.1] tracking-tight mb-5
        "
      >
        <span className="text-white">ITIN</span>{" "}
        <span className="text-[#818CF8]">Application</span>
      </h1>

      <p className="text-center text-white/50 text-lg sm:text-xl max-w-md mb-10 leading-relaxed">
        Individual Taxpayer Identification Number
        <br />
        <span className="text-white/40">No mailing your passport. We certify on-site.</span>
      </p>

      {/* CTA */}
      <button
        onClick={onStart}
        className="
          group relative px-12 py-5 rounded-2xl
          bg-[#4F56E8] text-white font-bold text-xl
          shadow-[0_0_40px_rgba(79,86,232,0.3)]
          hover:shadow-[0_0_60px_rgba(79,86,232,0.4)]
          hover:bg-[#5B63F0]
          active:scale-[0.97]
          transition-all duration-300 ease-out
        "
      >
        <span className="flex items-center gap-3">
          Start Application
          <svg
            className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
      </button>

      {/* Trust indicators */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-white/50 text-base font-medium">
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          Secure &amp; Encrypted
        </span>
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Takes 5–10 minutes
        </span>
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Have your passport ready
        </span>
      </div>
    </div>
  );
}

/* ─── Success Screen ─── */
function SuccessScreen({ onReset }: { onReset: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`
        flex-1 flex flex-col items-center justify-center px-6 pb-12
        transition-all duration-700 ease-out
        ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
      `}
    >
      {/* Success checkmark */}
      <div
        className="
          w-24 h-24 rounded-full mb-8
          bg-gradient-to-br from-emerald-400 to-emerald-600
          flex items-center justify-center
          shadow-[0_0_60px_rgba(52,211,153,0.3)]
        "
      >
        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
        Application Submitted
      </h2>

      <p className="text-white/50 text-center text-base sm:text-lg max-w-md mb-2 leading-relaxed">
        Your ITIN application has been received. Our IRS Certified Acceptance Agent will review
        your information and contact you for next steps.
      </p>

      {/* Document upload confirmation */}
      <div className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <span className="text-emerald-400/80 text-sm font-medium">
          Documents securely uploaded
        </span>
      </div>

      <p className="text-white/30 text-sm text-center mb-10">
        Please hand the tablet back to our staff.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onReset}
          className="
            px-8 py-4 rounded-xl
            bg-[#4F56E8] text-white font-semibold text-base
            hover:bg-[#5B63F0] active:scale-[0.97]
            transition-all duration-200
          "
        >
          Next Applicant
        </button>
        <a
          href="https://wa.me/19299331396"
          target="_blank"
          rel="noopener noreferrer"
          className="
            px-8 py-4 rounded-xl text-center
            bg-white/10 text-white/70 font-semibold text-base
            hover:bg-white/15 hover:text-white/90 active:scale-[0.97]
            transition-all duration-200
          "
        >
          Contact via WhatsApp
        </a>
      </div>

      {/* Auto-reset notice */}
      <p className="mt-8 text-white/20 text-xs">
        This screen will reset automatically in 30 seconds.
      </p>
    </div>
  );
}
