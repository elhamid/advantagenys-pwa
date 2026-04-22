"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ItinForm } from "./ItinForm";
import { useInAppBrowser, safeBlankTarget } from "@/hooks/useInAppBrowser";


const COMPANIES = [
  { slug: "tropical-stars", name: "Tropical Stars Inc.", logo: "/images/tropical-stars-logo.png" },
] as const;

type Company = (typeof COMPANIES)[number];

function findCompany(slug?: string): Company | null {
  if (!slug) return null;
  return COMPANIES.find((c) => c.slug === slug) ?? null;
}

type Stage = "welcome" | "form" | "success";

interface ItinKioskProps {
  testMode?: boolean;
  companySlug?: string;
}

export function ItinKiosk({ testMode = false, companySlug }: ItinKioskProps) {
  const preselected = findCompany(companySlug);
  const [stage, setStage] = useState<Stage>("welcome");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(preselected);
  const [fadeIn, setFadeIn] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fade-in on mount
  useEffect(() => {
    requestAnimationFrame(() => setFadeIn(true));
  }, []);

  // Auto-reset is now handled inside SuccessScreen (kiosk: 30s reset, personal: 10s redirect)

  const resetToWelcome = useCallback(() => {
    setStage("welcome");
    setSelectedCompany(preselected);
    setShowConfirm(false);
  }, [preselected]);

  const handleStartOver = useCallback(() => {
    if (stage === "form") {
      setShowConfirm(true);
    } else {
      resetToWelcome();
    }
  }, [stage, resetToWelcome]);


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
        {stage === "welcome" && (
          <WelcomeScreen
            preselectedCompany={preselected}
            onStart={(company) => {
              setSelectedCompany(company);
              setStage("form");
            }}
          />
        )}
        {stage === "form" && (
          <ItinForm
            onSuccess={() => setStage("success")}
            testMode={testMode}
            companyName={selectedCompany?.name}
          />
        )}
        {stage === "success" && <SuccessScreen onReset={resetToWelcome} isKiosk={!!preselected} />}
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
function WelcomeScreen({
  preselectedCompany,
  onStart,
}: {
  preselectedCompany: Company | null;
  onStart: (company: Company | null) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [pickedSlug, setPickedSlug] = useState<string>(
    preselectedCompany?.slug ?? ""
  );

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // If company is preselected via URL, show simplified welcome
  if (preselectedCompany) {
    return (
      <div
        className={`
          flex-1 flex flex-col items-center justify-center px-6 pb-12
          transition-all duration-700 ease-out
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
      >
        {/* Company branding */}
        <div className="mb-6 flex flex-col items-center">
          <Image
            src={preselectedCompany.logo}
            alt={preselectedCompany.name}
            width={192}
            height={90}
            priority
          />
        </div>

        {/* Company badge */}
        <div className="mb-4 px-5 py-2.5 rounded-full bg-white/[0.06] border border-white/10">
          <span className="text-white/70 text-sm font-semibold">
            {preselectedCompany.name}
          </span>
        </div>

        <WelcomeHeading />

        {/* CTA */}
        <button
          onClick={() => onStart(preselectedCompany)}
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
            <ArrowRight />
          </span>
        </button>

        <TrustIndicators />
      </div>
    );
  }

  // No preselected company — show two-path selector
  const pickedCompany = COMPANIES.find((c) => c.slug === pickedSlug) ?? null;

  return (
    <div
      className={`
        flex-1 flex flex-col items-center justify-center px-6 pb-12
        transition-all duration-700 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
    >
      {/* Logo */}
      <div className="mb-5 flex flex-col items-center">
        <Image
          src="/icons/icon-192.png"
          alt="Advantage Services"
          width={64}
          height={64}
          priority
          className="rounded-xl"
        />
      </div>

      <WelcomeHeading />

      {/* Two paths */}
      <div className="w-full max-w-md space-y-4 mb-8">
        {/* Path 1: Employer sent me */}
        <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#4F56E8]/15 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#818CF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-base">My employer sent me</h3>
              <p className="text-white/40 text-sm">Select your company</p>
            </div>
          </div>

          <select
            value={pickedSlug}
            onChange={(e) => setPickedSlug(e.target.value)}
            className="
              w-full px-4 py-3.5 rounded-xl text-base font-medium appearance-none
              bg-white/[0.06] border border-white/10 text-white
              hover:bg-white/[0.08] transition-all duration-200 cursor-pointer
              mb-3 pr-10
            "
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.4)' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.75rem center",
            }}
          >
            <option value="" className="bg-[#0F1B2D] text-white/50">Choose company...</option>
            {COMPANIES.map((c) => (
              <option key={c.slug} value={c.slug} className="bg-[#0F1B2D] text-white">
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => onStart(pickedCompany)}
            disabled={!pickedCompany}
            className={`
              w-full py-3.5 rounded-xl font-semibold text-base
              transition-all duration-200 active:scale-[0.97]
              ${
                pickedCompany
                  ? "bg-[#4F56E8] text-white hover:bg-[#5B63F0] shadow-[0_0_30px_rgba(79,86,232,0.2)]"
                  : "bg-white/5 text-white/25 cursor-not-allowed"
              }
            `}
          >
            <span className="flex items-center justify-center gap-2">
              Continue with employer
              <ArrowRight />
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs font-semibold uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Path 2: Individual */}
        <button
          onClick={() => onStart(null)}
          className="
            w-full rounded-2xl bg-white/[0.04] border border-white/10 p-5
            hover:bg-white/[0.06] hover:border-white/15
            active:scale-[0.98] transition-all duration-200 text-left
          "
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-base">I&apos;m applying individually</h3>
              <p className="text-white/40 text-sm">No employer referral</p>
            </div>
            <ArrowRight />
          </div>
        </button>
      </div>

      <TrustIndicators />
    </div>
  );
}

/* ─── Shared Welcome Parts ─── */
function WelcomeHeading() {
  return (
    <>
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
    </>
  );
}

function TrustIndicators() {
  return (
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
        Takes 5-10 minutes
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
  );
}

function ArrowRight() {
  return (
    <svg
      className="w-5 h-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}

/* ─── Success Screen ─── */
function SuccessScreen({ onReset, isKiosk }: { onReset: () => void; isKiosk: boolean }) {
  const inAppBrowser = useInAppBrowser();
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(isKiosk ? 30 : 10);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Auto-redirect: kiosk resets to welcome, personal phone goes to homepage
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (isKiosk) {
            onReset();
          } else {
            window.location.href = "/";
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isKiosk, onReset]);

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
        {isKiosk ? "Application Submitted" : "You're All Done!"}
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

      {isKiosk ? (
        <>
          <p className="text-white/30 text-sm text-center mb-10">
            Please hand the tablet back to our staff. Resets in {countdown}s.
          </p>
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
        </>
      ) : (
        <>
          <p className="text-white/40 text-sm text-center mb-6">
            We&apos;ll be in touch shortly. Thank you for choosing Advantage Services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/"
              className="
                px-8 py-4 rounded-xl text-center
                bg-[#4F56E8] text-white font-semibold text-base
                hover:bg-[#5B63F0] active:scale-[0.97]
                transition-all duration-200
              "
            >
              Back to Home
            </a>
            <a
              href="https://wa.me/19299331396"
              target={safeBlankTarget(inAppBrowser)}
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
          <p className="text-white/20 text-xs text-center mt-6">
            Redirecting to homepage in {countdown}s...
          </p>
        </>
      )}

      {/* Auto-reset notice */}
      <p className="mt-8 text-white/20 text-xs">
        This screen will reset automatically in 30 seconds.
      </p>
    </div>
  );
}
