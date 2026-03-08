"use client";

import { Container } from "@/components/ui/Container";
import { useCountUp } from "@/hooks/useCountUp";

function CountUpSignal({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const { ref, count } = useCountUp(target, 2000);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl sm:text-4xl font-bold" style={{ color: "var(--blue-accent)" }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="mt-1 text-sm text-[var(--text-secondary)]">{label}</div>
    </div>
  );
}

function StaticSignal({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-bold" style={{ color: "var(--blue-accent)" }}>
        {value}
      </div>
      <div className="mt-1 text-sm text-[var(--text-secondary)]">{label}</div>
    </div>
  );
}

export function TrustSignals() {
  return (
    <section className="py-12 bg-[var(--blue-bg)] border-y border-[var(--border)]">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <CountUpSignal target={20} suffix="+" label="Years in Business" />
          <CountUpSignal target={2250} suffix="+" label="ITINs Processed" />
          <StaticSignal value="IRS Certified" label="Acceptance Agent" />
          <StaticSignal value="Licensed" label="Insurance Broker" />
        </div>
      </Container>
    </section>
  );
}
