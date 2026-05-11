"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { PushOptInPrompt } from "@/components/booking/PushOptInPrompt";

const REDIRECT_SECONDS = 15;

interface ConfirmedClientProps {
  appointmentId?: string;
  isInert: boolean;
}

/**
 * Client shell for /book/confirmed — renders push opt-in, install prompts,
 * and a 15-second auto-redirect countdown to home.
 */
export function ConfirmedClient({ appointmentId, isInert }: ConfirmedClientProps) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  const cancelled = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cancelRedirect = useCallback(() => {
    cancelled.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSecondsLeft(-1); // -1 signals cancelled
  }, []);

  // Countdown timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Redirect when countdown hits 0
  useEffect(() => {
    if (secondsLeft === 0 && !cancelled.current) {
      router.push("/");
    }
  }, [secondsLeft, router]);

  // Cancel on any click/tap on the page (covers all CTAs, links, buttons)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button")) {
        cancelRedirect();
      }
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [cancelRedirect]);

  return (
    <>
      {/* Push opt-in (live mode only) */}
      {!isInert && <PushOptInPrompt appointmentId={appointmentId} />}

      {/* Auto-redirect countdown */}
      {secondsLeft > 0 && (
        <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
          Redirecting to home in {secondsLeft}s&hellip;{" "}
          <button
            type="button"
            onClick={cancelRedirect}
            className="underline underline-offset-2 hover:text-[var(--text-secondary)] transition-colors"
          >
            Cancel
          </button>
        </p>
      )}
    </>
  );
}
