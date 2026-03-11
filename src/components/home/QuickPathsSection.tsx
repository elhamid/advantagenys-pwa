"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { PHONE, SEGMENTS, SERVICES, STATS } from "@/lib/constants";
import { GOOGLE_RATING } from "@/lib/reviews";

const TRUST_ITEMS = [
  { value: `${STATS.businessSetups.count}+`, label: "businesses formed" },
  { value: `${STATS.taxClients.count}+`, label: "tax clients served" },
  { value: `${GOOGLE_RATING.rating}/5`, label: "Google rating" },
];

const FEATURED_SERVICES = SERVICES.slice(0, 5);

export function QuickPathsSection() {
  return (
    <section className="relative bg-white py-10 md:py-14">
      <Container className="space-y-8">
        <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <Badge className="mb-3 !bg-[var(--blue-bg)] !text-[var(--navy)]">
                Start Where You Are
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 md:text-4xl">
                Choose the path that gets you to revenue faster.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 md:text-base">
                Instead of reading a long brochure, jump into the business path that
                matches your situation right now.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 md:min-w-[360px]">
              {TRUST_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm"
                >
                  <div className="text-lg font-bold tracking-tight text-slate-950 md:text-2xl">
                    {item.value}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-500 md:text-xs">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:mt-8 md:grid-cols-3">
            {SEGMENTS.map((segment) => (
              <Link
                key={segment.name}
                href={segment.href}
                className="group rounded-[24px] border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--blue-soft)] hover:shadow-[0_18px_50px_rgba(79,86,232,0.12)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--blue-accent)]">
                    {segment.name}
                  </div>
                  <div className="rounded-full bg-[var(--blue-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--navy)]">
                    Priority Path
                  </div>
                </div>

                <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
                  {segment.tagline}
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {segment.journey}
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-950">
                  Explore path
                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] bg-slate-950 px-5 py-5 text-white md:mt-8 md:px-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/55">
                  Most Requested Help
                </div>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {FEATURED_SERVICES.map((service) => (
                    <Link
                      key={service.name}
                      href={service.href}
                      className="rounded-full border border-white/12 bg-white/6 px-3.5 py-2 text-sm text-white/88 transition-colors hover:bg-white/12"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={PHONE.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-300"
                >
                  WhatsApp {PHONE.whatsapp}
                </a>
                <a
                  href={`tel:${PHONE.mainTel}`}
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-100"
                >
                  Call {PHONE.main}
                </a>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center rounded-full border border-white/18 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Browse all services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
