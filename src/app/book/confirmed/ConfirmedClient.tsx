"use client";

import { PushOptInPrompt } from "@/components/booking/PushOptInPrompt";

interface ConfirmedClientProps {
  appointmentId?: string;
  isInert: boolean;
}

/**
 * Client shell for /book/confirmed — renders push opt-in and install prompts.
 * Only shows push nudge on the live booking path (not inert mode).
 */
export function ConfirmedClient({ appointmentId, isInert }: ConfirmedClientProps) {
  // Don't show push/install prompts for the "inert" path (no slot chosen)
  if (isInert) return null;

  return <PushOptInPrompt appointmentId={appointmentId} />;
}
