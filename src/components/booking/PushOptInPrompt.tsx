"use client";

import { useEffect, useState } from "react";

interface PushOptInPromptProps {
  /** Optional appointment ID — forwarded to subscription endpoint for targeting */
  appointmentId?: string;
}

type PermissionState = "default" | "granted" | "denied" | "unsupported";
type InstallPromptState = "show" | "hidden" | "installed";

/**
 * PushOptInPrompt — shown on /book/confirmed after a successful booking.
 *
 * Handles two nudges in one component:
 *  1. Push notification opt-in (if permission === 'default')
 *  2. "Add to home screen" hint (if not running in standalone mode)
 */
export function PushOptInPrompt({ appointmentId }: PushOptInPromptProps) {
  const [permState, setPermState] = useState<PermissionState>("unsupported");
  const [installState, setInstallState] = useState<InstallPromptState>("hidden");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushDone, setPushDone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect environment
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;

    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsIOS(ios);

    // Push permission state
    if ("Notification" in window && "serviceWorker" in navigator) {
      setPermState(Notification.permission as PermissionState);
    }

    // Install prompt — Android Chrome fires this before we can listen if page
    // loads after the browser decided to show it; capture it via window event.
    if (!isStandalone && !ios) {
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setInstallState("show");
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    } else if (!isStandalone && ios) {
      // iOS: always show the manual hint (no beforeinstallprompt on iOS)
      setInstallState("show");
    }
  }, []);

  // ── Push opt-in ──────────────────────────────────────────────────────────────
  async function handleEnableNotifications() {
    if (pushLoading) return;
    setPushLoading(true);

    try {
      const permission = await Notification.requestPermission();
      setPermState(permission as PermissionState);

      if (permission !== "granted") {
        setPushLoading(false);
        return;
      }

      // Subscribe via pushManager
      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.warn("[PushOptIn] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set");
        setPushDone(true);
        setPushLoading(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
      });

      // Send subscription to PWA backend
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription, appointment_id: appointmentId }),
      });

      setPushDone(true);
    } catch (err) {
      console.warn("[PushOptIn] subscription failed:", err);
    } finally {
      setPushLoading(false);
    }
  }

  // ── Android install prompt ───────────────────────────────────────────────────
  async function handleAndroidInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallState("installed");
    }
    setDeferredPrompt(null);
  }

  const showPushPrompt =
    (permState === "default" || permState === "denied") &&
    "Notification" in window &&
    !pushDone;
  const showInstallPrompt = installState === "show";

  if (!showPushPrompt && !showInstallPrompt) return null;

  return (
    <div className="mt-6 flex flex-col gap-3">
      {/* Push opt-in card */}
      {showPushPrompt && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-section)] p-4 text-left">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-xl" aria-hidden="true">🔔</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--text)] leading-snug mb-1">
                Get a reminder before your appointment
              </p>
              <p className="text-xs text-[var(--text-secondary)] mb-3">
                We&apos;ll send a 2-hour heads-up so you&apos;re never caught off guard.
              </p>
              {permState === "default" && (
                <button
                  onClick={handleEnableNotifications}
                  disabled={pushLoading}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--blue-accent)] px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {pushLoading ? "Setting up…" : "Allow notifications"}
                </button>
              )}
              {permState === "denied" && (
                <p className="text-xs text-[var(--text-muted)]">
                  Notifications blocked. Enable them in your browser settings to get appointment reminders.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Push success state */}
      {pushDone && (
        <p className="text-xs text-[var(--text-secondary)] text-center">
          Notifications on — you&apos;ll get a reminder 2 hours before your appointment.
        </p>
      )}

      {/* Install hint card */}
      {showInstallPrompt && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-section)] p-4 text-left">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-xl" aria-hidden="true">📲</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--text)] leading-snug mb-1">
                Add to your home screen
              </p>
              {isIOS ? (
                <p className="text-xs text-[var(--text-secondary)]">
                  Tap <strong>Share</strong> at the bottom of Safari, then choose{" "}
                  <strong>Add to Home Screen</strong>.
                </p>
              ) : (
                <>
                  <p className="text-xs text-[var(--text-secondary)] mb-3">
                    Quick access to booking, forms, and updates — no App Store needed.
                  </p>
                  {deferredPrompt && (
                    <button
                      onClick={handleAndroidInstall}
                      className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--blue-accent)] bg-transparent px-4 py-2 text-xs font-bold text-[var(--blue-accent)] hover:bg-[var(--blue-accent)] hover:text-white transition-colors"
                    >
                      Install app
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Convert a base64url VAPID public key to a Uint8Array for pushManager.subscribe.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
