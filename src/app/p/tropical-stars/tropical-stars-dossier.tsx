"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  Handshake,
  LockKeyhole,
  MessagesSquare,
  Route,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UsersRound,
  WalletCards,
} from "lucide-react";

const ACCESS_CODES = new Set([
  "TS-GROWTH-2026",
  "TROPICAL-STARS",
  "TROPICAL",
  "ADVANTAGE",
]);

const metrics = [
  { value: "789", label: "contractor records already touched through ITIN work" },
  { value: "2-3x", label: "growth target that needs a firmer operating foundation" },
  { value: "4", label: "growth lanes: finance, crew, demand, delivery" },
  { value: "1", label: "owner focus: higher-value accounts and partnerships" },
];

const journey = [
  {
    step: "01",
    title: "Reground",
    text: "Clean up the base: books, tax posture, insurance exposure, contractor records, cash flow, and the weekly truth of the business.",
  },
  {
    step: "02",
    title: "Organize",
    text: "Give the existing crew clearer lanes, visible follow-up, better intake, and fewer dropped handoffs so the company gets more from the team it already has.",
  },
  {
    step: "03",
    title: "Empower",
    text: "Move the owner from constantly finding and fixing leaks into focused growth work: accounts, partnerships, contracts, and strategic relationships.",
  },
  {
    step: "04",
    title: "Scale",
    text: "Build the structure needed for a larger company: stronger reporting, repeatable delivery, client profitability, and segment-specific growth plays.",
  },
];

const phases = [
  {
    title: "See the Business Clearly",
    eyebrow: "Foundation",
    text: "Clean books, entity/tax review, cash-flow reporting, job profitability, payroll and insurance exposure. The goal is to stop running the company from fragments.",
    items: ["Monthly reconciliations", "P&L and cash-flow pack", "Client/job profitability", "Compliance exposure map"],
  },
  {
    title: "Make the Existing Crew Produce More",
    eyebrow: "Leverage",
    text: "The first growth win is not always more people. It is fewer dropped handoffs, clearer ownership, faster follow-up, and a crew that knows what matters each week.",
    items: ["Role scorecards", "Follow-up cadence", "Recruiting/talent queue", "Shift and job readiness checks"],
  },
  {
    title: "Move the Owner Into Growth",
    eyebrow: "Focus",
    text: "The owner should spend less time discovering leaks and more time opening doors: hotels, event venues, restaurants, property managers, airport-adjacent accounts, and strategic contracts.",
    items: ["Owner growth dashboard", "Weekly decision memo", "Account target list", "Partnership pipeline"],
  },
  {
    title: "Turn Growth Into an Operating System",
    eyebrow: "Scale",
    text: "CRM, lead capture, recruiting intake, AI summaries, bookkeeping reports, and delivery tasks become one visible pipe from opportunity to invoice.",
    items: ["CRM/taskboard", "Lead and applicant intake", "Revenue analytics", "AI-assisted routing"],
  },
];

const valueAdded = [
  {
    title: "Core Demand Lift",
    text: "Long-term parking lots with valet, security, pickup/drop-off, airport contracts, and adjacent demand generators can make parking itself more attractive while creating extra revenue.",
  },
  {
    title: "Tropical Translation",
    text: "Hospitality staffing can do the same: add reliable training, compliance readiness, rapid-fill crisis teams, scheduling visibility, and performance reporting so the core staffing offer becomes easier to buy.",
  },
  {
    title: "Growth Principle",
    text: "Value-added services should not distract from the main business. They should make the main business more valuable, easier to sell, and harder to replace.",
  },
];

const operatingStack = [
  { icon: WalletCards, title: "Bookkeeping + Tax", text: "Monthly books, statements, tax planning, corp filings, cash-flow review." },
  { icon: ShieldCheck, title: "Risk + Compliance", text: "Workers comp, payroll classification, audit readiness, insurance gaps." },
  { icon: UsersRound, title: "Crew Productivity", text: "Clear owners, open loops, applicant readiness, follow-up accountability." },
  { icon: Target, title: "Client Acquisition", text: "Hotels, F&B, events, stadiums, cleaning, and property operators." },
  { icon: MessagesSquare, title: "Intake + CRM", text: "Every employer lead, talent lead, and service issue captured in one pipe." },
  { icon: BarChart3, title: "Growth Analytics", text: "Pipeline, close rate, revenue by source, revenue at risk, margin by segment." },
];

const hospitalityLanes = [
  "Hotels and accommodation staffing",
  "Restaurant, food and beverage teams",
  "Stadium and event staffing",
  "Crisis housekeeping and deep cleaning",
  "Business staffing and admin support",
  "Airport-adjacent and venue contracts",
];

const ownerFocus = [
  "Which accounts should I personally pursue?",
  "Where is money leaking this week?",
  "Which crew member or manager owns the fix?",
  "Which clients are profitable enough to expand?",
  "Which leads or applicants are stuck?",
  "What can wait because it is not growth-critical?",
];

function accessFromLocation() {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash.replace("#", "").trim().toUpperCase();
  const query = new URLSearchParams(window.location.search).get("code")?.trim().toUpperCase();
  return ACCESS_CODES.has(hash) || (query ? ACCESS_CODES.has(query) : false);
}

export function TropicalStarsDossier() {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const preparedDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date("2026-06-05T12:00:00-04:00")),
    []
  );

  useEffect(() => {
    if (accessFromLocation() || window.localStorage.getItem("ts-dossier-access") === "granted") {
      setUnlocked(true);
    }
  }, []);

  function submitAccess(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (ACCESS_CODES.has(normalized)) {
      window.localStorage.setItem("ts-dossier-access", "granted");
      setUnlocked(true);
      setError("");
      return;
    }
    setError("Access code not recognized.");
  }

  if (!unlocked) {
    return (
      <main className="min-h-screen overflow-hidden bg-[#f5efe4] text-[#211b14]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_8%,rgba(176,142,91,0.22),transparent_34%),radial-gradient(circle_at_12%_82%,rgba(31,97,69,0.14),transparent_38%)]" />
        <section className="relative z-10 flex min-h-screen items-center justify-center px-5">
          <form
            onSubmit={submitAccess}
            className="w-full max-w-[440px] rounded-[18px] border border-[#d8cbb8] bg-[#fffdf8] p-7 shadow-[0_28px_70px_-36px_rgba(59,45,25,0.55)] sm:p-9"
          >
            <Image
              src="/images/tropical-stars-logo.png"
              alt="Tropical Stars Talent Solutions"
              width={192}
              height={90}
              priority
              className="mb-8 h-auto w-44"
            />
            <div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.22em] text-[#98743f]">
              <LockKeyhole className="h-4 w-4" />
              Private Growth Dossier
            </div>
            <h1 className="font-[family-name:var(--font-dossier-serif)] text-[2rem] font-semibold leading-none tracking-tight text-[#211b14]">
              Prepared for Tropical Stars.
            </h1>
            <p className="mt-4 text-sm leading-6 text-[#6f6557]">
              Confidential Advantage Services operating memo. Confirm access to
              continue.
            </p>
            <label htmlFor="access-code" className="mt-7 block text-xs font-bold uppercase tracking-[0.18em] text-[#7a6b57]">
              Access code
            </label>
            <input
              id="access-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#d8cbb8] bg-[#f7f2e8] px-4 py-3 font-mono text-sm tracking-[0.12em] text-[#211b14] outline-none transition focus:border-[#a77d42] focus:ring-4 focus:ring-[#ead9bb]"
              placeholder="TS-GROWTH-2026"
              autoComplete="off"
              spellCheck={false}
            />
            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#9f7a45] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#866435]">
              Enter dossier
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-3 min-h-5 text-sm font-semibold text-[#8a342f]">{error}</p>
            <p className="mt-5 border-t border-[#e4d8c5] pt-4 text-[11px] leading-5 text-[#8d8171]">
              This page is prepared for named recipients only. It is a strategic
              discussion artifact, not a final accounting agreement.
            </p>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f0e6] text-[#211b14]">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_82%_6%,rgba(171,135,78,0.18),transparent_31%),radial-gradient(circle_at_8%_45%,rgba(22,90,65,0.10),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.52),rgba(255,255,255,0))]" />
      <header className="sticky top-0 z-40 border-b border-[#e1d4c0] bg-[#f6f0e6]/86 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5 sm:px-8">
          <Image
            src="/images/tropical-stars-logo.png"
            alt="Tropical Stars Talent Solutions"
            width={192}
            height={90}
            priority
            className="h-auto w-28"
          />
          <div className="hidden h-7 w-px bg-[#d8cbb8] sm:block" />
          <div className="min-w-0">
            <div className="truncate text-xs font-extrabold uppercase tracking-[0.18em] text-[#907141]">
              Advantage Services
            </div>
            <div className="truncate text-xs text-[#6f6557]">
              Growth operating system dossier
            </div>
          </div>
          <div className="ml-auto hidden rounded-full border border-[#d8cbb8] bg-[#fffdf8] px-4 py-2 text-xs font-bold text-[#6f6557] md:block">
            Prepared {preparedDate}
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-8 px-5 pb-12 pt-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-16 lg:pt-14">
        <div>
          <div className="mb-5 inline-flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#916b32]">
            <span className="h-px w-8 bg-[#a77d42]" />
            Confidential strategy memo
          </div>
          <h1 className="font-[family-name:var(--font-dossier-serif)] text-[clamp(2.8rem,7vw,5.85rem)] font-semibold leading-[0.92] tracking-tight">
            Tropical Stars
            <span className="block text-[#9f7a45]">Growth Operating System</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[1.05rem] leading-8 text-[#4f463b]">
            Tropical already knows how to grow. Advantage Services is here to
            help her grow on a different scale: firm the foundation, organize
            the crew around the right signals, and free the owner to pursue
            larger accounts, partnerships, and contracts.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["Stabilize", "Productivity", "Owner focus", "2-3x growth path"].map((item) => (
              <span key={item} className="rounded-full border border-[#d8cbb8] bg-[#fffdf8] px-4 py-2 text-sm font-bold text-[#4f463b] shadow-sm">
                {item}
              </span>
            ))}
          </div>
        </div>

        <aside className="rounded-[18px] border border-[#d8cbb8] bg-[#fffdf8] p-5 shadow-[0_24px_70px_-42px_rgba(39,29,16,0.6)] sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#98743f]">
                Owner leverage
              </div>
              <h2 className="mt-3 font-[family-name:var(--font-dossier-serif)] text-3xl font-semibold leading-tight">
                Stop making the owner the operating system.
              </h2>
            </div>
            <Gauge className="h-9 w-9 shrink-0 text-[#0f5a43]" />
          </div>
          <div className="mt-7 grid gap-3">
            {ownerFocus.map((question) => (
              <div key={question} className="flex items-start gap-3 rounded-xl border border-[#e5dac9] bg-[#f8f3ea] p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0f5a43]" />
                <span className="text-sm font-semibold leading-5 text-[#4f463b]">{question}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid overflow-hidden rounded-[18px] border border-[#d8cbb8] bg-[#fffdf8] shadow-[0_18px_60px_-42px_rgba(39,29,16,0.55)] sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <div key={metric.label} className={`p-6 ${index < metrics.length - 1 ? "border-b border-[#e6dac7] sm:border-r lg:border-b-0" : ""}`}>
              <div className="font-[family-name:var(--font-dossier-serif)] text-5xl font-semibold leading-none text-[#211b14]">
                {metric.value}
              </div>
              <div className="mt-3 text-sm font-semibold leading-5 text-[#6f6557]">{metric.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <SectionHeader
          eyebrow="The trajectory"
          title="A larger company needs a firmer foundation."
          text="The diagnostic work is not the destination. It is the grounding work that lets Tropical grow without carrying the same leaks, handoff gaps, and hidden risks into a bigger operation."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {journey.map((item) => (
            <article key={item.step} className="rounded-[18px] border border-[#d8cbb8] bg-[#fffdf8] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#98743f]">{item.title}</span>
                <span className="font-[family-name:var(--font-dossier-serif)] text-2xl font-semibold text-[#c1ad8d]">{item.step}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#5f564b]">{item.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-9 grid gap-5 lg:grid-cols-4">
          {phases.map((phase, index) => (
            <article key={phase.title} className="group rounded-[18px] border border-[#d8cbb8] bg-[#fffdf8] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-42px_rgba(39,29,16,0.55)]">
              <div className="mb-5 flex items-center justify-between">
                <span className="rounded-full bg-[#e8dbc3] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#7d5b28]">
                  {phase.eyebrow}
                </span>
                <span className="font-[family-name:var(--font-dossier-serif)] text-2xl font-semibold text-[#c1ad8d]">
                  0{index + 1}
                </span>
              </div>
              <h3 className="font-[family-name:var(--font-dossier-serif)] text-2xl font-semibold leading-tight">
                {phase.title}
              </h3>
              <p className="mt-4 text-sm leading-6 text-[#6f6557]">{phase.text}</p>
              <ul className="mt-5 space-y-2">
                {phase.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm font-semibold text-[#4f463b]">
                    <ArrowRight className="h-3.5 w-3.5 text-[#0f5a43]" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 border-y border-[#e1d4c0] bg-[#211b14] py-16 text-[#f6f0e6] lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#d7bd89]">
              <Sparkles className="h-4 w-4" />
              Jay's transferable proof
            </div>
            <h2 className="font-[family-name:var(--font-dossier-serif)] text-[clamp(2.4rem,5vw,4.8rem)] font-semibold leading-[0.95]">
              Value-added services can lift the main business.
            </h2>
            <p className="mt-7 max-w-xl text-base leading-7 text-[#d8cbb8]">
              In the Layover parking model, the added service is not just a side
              income line. It makes the parking lot more useful, more memorable,
              and more differentiated. Tropical can use the same operating
              logic in hospitality staffing.
            </p>
          </div>
          <div className="grid gap-4">
            {valueAdded.map((card) => (
              <div key={card.title} className="rounded-[18px] border border-[#594832] bg-[#2a2319] p-5">
                <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#d7bd89]">{card.title}</div>
                <p className="mt-3 text-sm leading-6 text-[#efe4d3]">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <SectionHeader
          eyebrow="Advantage operating stack"
          title="What we install around the owner."
          text="Advantage Services brings the grounding layer and the growth layer together: financial clarity, tax and compliance posture, insurance and audit readiness, client acquisition, intake discipline, reporting, and weekly operating cadence."
        />
        <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {operatingStack.map((item) => (
            <article key={item.title} className="rounded-[18px] border border-[#d8cbb8] bg-[#fffdf8] p-6">
              <item.icon className="h-7 w-7 text-[#0f5a43]" />
              <h3 className="mt-5 font-[family-name:var(--font-dossier-serif)] text-2xl font-semibold">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#6f6557]">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-8 px-5 pb-16 sm:px-8 lg:grid-cols-[1fr_1fr] lg:pb-20">
        <div className="rounded-[18px] border border-[#d8cbb8] bg-[#fffdf8] p-7">
          <div className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.22em] text-[#98743f]">
            <BriefcaseBusiness className="h-4 w-4" />
            Hospitality growth lanes
          </div>
          <div className="mt-6 grid gap-3">
            {hospitalityLanes.map((lane) => (
              <div key={lane} className="flex items-center gap-3 rounded-xl border border-[#e6dac7] bg-[#f8f3ea] p-4">
                <Route className="h-4 w-4 shrink-0 text-[#0f5a43]" />
                <span className="text-sm font-bold text-[#4f463b]">{lane}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[18px] border border-[#d8cbb8] bg-[#fffdf8] p-7">
          <div className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.22em] text-[#98743f]">
            <TrendingUp className="h-4 w-4" />
            The 2-3x path
          </div>
          <div className="mt-7 space-y-5">
            <TrajectoryRow icon={SearchCheck} label="Control leakage" text="No growth plan works if profit, follow-up, billing, or compliance leaks stay invisible." />
            <TrajectoryRow icon={ClipboardCheck} label="Standardize delivery" text="Crew and managers get repeatable checklists, visible ownership, and fewer handoff failures." />
            <TrajectoryRow icon={Handshake} label="Win larger accounts" text="Owner attention shifts toward hotels, venues, events, airport-adjacent operators, and strategic partners." />
            <TrajectoryRow icon={CalendarCheck} label="Run the cadence" text="Weekly growth and operations review turns data into decisions, not more cleanup work." />
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="rounded-[20px] border border-[#0f5a43]/25 bg-[#dfece3] p-7 sm:p-9 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#0f5a43]">
              Recommended direction
            </div>
            <h2 className="mt-4 font-[family-name:var(--font-dossier-serif)] text-3xl font-semibold leading-tight sm:text-5xl">
              Ground the company first, then help Tropical grow at a larger scale.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[#3f5147]">
              Advantage Services represents the full foundation: books, tax,
              insurance, compliance, reporting, operating rhythm, and growth
              discipline. The goal is to make the existing crew more productive,
              reduce leak-finding noise, and give the owner the visibility and
              focus to pursue larger accounts.
            </p>
          </div>
          <div className="mt-7 shrink-0 rounded-2xl border border-[#b7d0bd] bg-[#fffdf8] p-5 lg:mt-0 lg:w-80">
            <div className="text-sm font-extrabold text-[#0f5a43]">Next working session</div>
            <p className="mt-2 text-sm leading-6 text-[#4f463b]">
              Confirm diagnostic package, name the first three leakage targets,
              define the owner growth targets, and choose the first dashboard
              views Tropical should see every week.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionHeader({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#916b32]">
        <span className="h-px w-8 bg-[#a77d42]" />
        {eyebrow}
      </div>
      <h2 className="font-[family-name:var(--font-dossier-serif)] text-[clamp(2.2rem,5vw,4.6rem)] font-semibold leading-[0.96] tracking-tight">
        {title}
      </h2>
      <p className="mt-5 text-base leading-7 text-[#6f6557]">{text}</p>
    </div>
  );
}

function TrajectoryRow({
  icon: Icon,
  label,
  text,
}: {
  icon: typeof SearchCheck;
  label: string;
  text: string;
}) {
  return (
    <div className="grid grid-cols-[42px_1fr] gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4efe6] text-[#0f5a43]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="font-[family-name:var(--font-dossier-serif)] text-xl font-semibold text-[#211b14]">
          {label}
        </div>
        <p className="mt-1 text-sm leading-6 text-[#6f6557]">{text}</p>
      </div>
    </div>
  );
}
