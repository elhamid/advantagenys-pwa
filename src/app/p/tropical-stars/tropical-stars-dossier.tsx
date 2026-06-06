"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  Handshake,
  HeartHandshake,
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
  MapPinned,
  UtensilsCrossed,
} from "lucide-react";

const ACCESS_CODES = new Set([
  "TSGROWTH",
  "TSGROWTH2026",
  "TROPICALSTARS",
  "TROPICAL",
  "ADVANTAGE",
]);

const metrics = [
  { value: "500+", label: "rolling people on payroll and active workforce" },
  { value: "3x", label: "target trajectory once the foundation can carry it" },
  { value: "NY + TN + GA", label: "operating footprint plus Georgia flagship: Merge Caribbean Cuisine" },
  { value: "1", label: "owner attention layer: visibility, structure, and growth choices" },
];

const founderPriorities = [
  {
    title: "Take care of the people",
    eyebrow: "What matters emotionally",
    text: "A rolling 500+ workforce is not just a number. Cleaner payroll visibility and fewer internal fires protect the people who make Tropical real.",
  },
  {
    title: "Make Merge worth the sacrifice",
    eyebrow: "The passion asset",
    text: "Merge has absorbed cash, attention, and founder energy. It is a crown jewel and showroom for Tropical, not another restaurant in a crowded category.",
  },
  {
    title: "Grow without losing the house",
    eyebrow: "The 3x path",
    text: "Tropical can move toward 3x only after the foundation is firm: reconciled books, visible leakage, tighter cadence, and owner time aimed at growth.",
  },
];

const journey = [
  {
    step: "01",
    title: "Reground",
    text: "Clean up the base: books, tax posture, entity structure, insurance exposure, certification readiness, contractor records, cash flow, and the weekly truth of the business.",
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
    text: "Clean books, entity/tax review, cash-flow reporting, job profitability, payroll, certification readiness, and insurance exposure. The goal is to stop running the company from fragments and feelings.",
    items: ["Monthly reconciliations", "P&L and cash-flow pack", "Client/job profitability", "Entity and certification map"],
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

const footprint = [
  { market: "New York", status: "Core operating base", note: "Hospitality staffing, account relationships, payroll/workforce activity." },
  { market: "Tennessee", status: "Active operating market", note: "Existing workforce and client operations that need the same financial visibility." },
  { market: "Georgia", status: "Flagship hospitality asset", note: "Merge Caribbean Cuisine in Duluth may become a proof point for premium service, events, bookings, and client-space growth once the economics are clear." },
];

const growthAssets = [
  { title: "Workforce trust", text: "A large rolling workforce gives Tropical reach, but only if payroll, classification, readiness, and follow-up stay clean." },
  { title: "Client relationships", text: "Hotels, restaurants, events, cleaning, and business operators can become larger accounts when delivery and reporting feel controlled." },
  { title: "Market footprint", text: "New York, Tennessee, and Georgia give Tropical more than one lane for expansion, but each market needs visible profitability." },
  { title: "Merge halo", text: "Merge is one important asset in the portfolio: a proud showcase for premium hospitality that may create new service formats after the foundation is firm." },
];

const structureInsights = [
  {
    icon: BriefcaseBusiness,
    title: "Entity architecture",
    text: "Review whether the three operating lanes belong under a cleaner holding-company structure, adjusted S-corp posture, or another arrangement that makes ownership, reporting, and responsibility easier to see.",
  },
  {
    icon: MapPinned,
    title: "State presence",
    text: "Clarify where Tropical is truly operating, earning, employing, and creating taxable presence across New York, Tennessee, and Georgia so future growth does not inherit old ambiguity.",
  },
  {
    icon: WalletCards,
    title: "Profit and loss visibility",
    text: "Show where one lane is carrying another, where losses may matter, and where profit is real enough to fund the next move instead of disappearing into the noise.",
  },
  {
    icon: ShieldCheck,
    title: "Coverage by geography",
    text: "Keep insurance and compliance coverage aligned with the current footprint and the next footprint, without overpaying, under-covering, or leaving claim exposure hidden.",
  },
  {
    icon: BarChart3,
    title: "Valuation readiness",
    text: "Prepare the company for valuation conversations by separating assets, obligations, recurring revenue, workforce strength, client concentration, and margin by line of business.",
  },
  {
    icon: Target,
    title: "Trust and continuity",
    text: "If ownership wants trust formation and legacy planning, the operating picture should be clean enough that the structure carries a real business, not a stack of unresolved questions.",
  },
  {
    icon: ClipboardCheck,
    title: "Minority and woman-owned certification",
    text: "Prepare the documentation trail for MWBE-style certification work so public-sector, institutional, and larger-account opportunities are not blocked by missing records.",
  },
];

const mergeSignals = [
  { label: "Positioning", text: "Caribbean cuisine with modern dining elegance in Duluth, Georgia." },
  { label: "Demand capture", text: "The public site is already collecting a mailing list before doors open." },
  { label: "Opening energy", text: "Exclusive opening-event invites can be tested as the first booking and relationship engine." },
  { label: "Location", text: "3505 Mall Blvd gives the flagship a concrete Georgia anchor for local partnerships." },
];

const flagshipMoves = [
  "Reconcile the flow of proceeds from the core business into the Georgia restaurant venture.",
  "Separate true Merge performance from shared overhead, opening costs, and owner-funded buildout.",
  "Show the owner where the business is healthier than it felt after the books are properly reconciled.",
  "Map the coming-soon mailing list and opening-event interest into possible booking, private-event, and follow-up lanes.",
  "Evaluate Merge as a premium proof of taste, service, and experience, not as a template to copy blindly.",
  "Model possible profit-making formats around the halo: catered activations, private dining, satellite experiences, consulting, and client-space takeovers where the Merge standard could travel.",
];

const marketBackedLanes = [
  {
    icon: UtensilsCrossed,
    title: "Merge as operating proof",
    thesis: "Hospitality proof",
    score: "High control",
    text: "Use Merge to show the standard Tropical can bring into other rooms: taste, welcome, training, service rhythm, booking discipline, and a premium guest experience.",
    pilot: "Opening-event playbook, private-event flow, service-standard notes.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Turnkey space operations",
    thesis: "Service without heavy buildout",
    score: "Best strategic fit",
    text: "Consider defined spaces where Tropical can bring the service without carrying the whole restaurant burden: private rooms, event service, lobby hospitality, catered activations, or premium support bundles.",
    pilot: "One client space, one scoped package, one margin readout.",
  },
  {
    icon: CalendarCheck,
    title: "Theater and venue concessions",
    thesis: "Venue hospitality",
    score: "Selective pilot",
    text: "Theaters and venues need food, beverage, staffing pace, and a room that feels cared for. Tropical can test a narrow service first before taking on broader operations.",
    pilot: "Concession support, premium event staffing, or cleaning plus service coverage.",
  },
  {
    icon: ShieldCheck,
    title: "Government contract readiness",
    thesis: "Bid-ready growth",
    score: "Stage-gated",
    text: "Public and institutional work should be staged carefully: records first, insurance and compliance fit, subcontracting or smaller openings, then bids where Tropical has proof it can serve well.",
    pilot: "SAM/UEI, capability statement, insurance map, subcontracting targets.",
  },
];

const marketSignals = [
  { value: "75%", label: "restaurant traffic now off-premises", source: "Industry context / NRA 2025" },
  { value: "15.7M", label: "restaurant and foodservice workers", source: "Labor market context / NRA" },
  { value: "SAM.gov", label: "entry point for federal bidding", source: "Readiness path / SBA" },
  { value: "Food + beverage", label: "major venue economics lever", source: "Cinema and venue context" },
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
  { icon: WalletCards, title: "Bookkeeping + Tax", text: "Monthly books, statements, tax planning, entity review, corp filings, cash-flow review." },
  { icon: ShieldCheck, title: "Risk + Compliance", text: "Workers comp, payroll classification, audit readiness, insurance gaps, state-by-state exposure." },
  { icon: UsersRound, title: "More from the crew you have", text: "Clear ownership on every account, jobs covered before they slip, applicants ready to place, and follow-ups that do not die in an inbox." },
  { icon: Target, title: "Win and keep accounts", text: "Hotels, F&B, events, stadiums, cleaning, and property operators pursued deliberately and delivered cleanly enough to renew and expand." },
  { icon: MessagesSquare, title: "Owner Visibility Room", text: "A friendly CRM view that shows what Advantage is working on without turning the owner into the task manager." },
  { icon: BarChart3, title: "The weekly scoreboard", text: "Pipeline, close rate, revenue by source, revenue at risk, and margin by segment, read in minutes instead of rebuilt by hand each month." },
];

const ownerCockpit = [
  "One view across staffing, Merge, consulting, bids, leads, payroll, and cash.",
  "Use restaurant POS/CRM data as inputs, not as another system for the owner to babysit.",
  "Share Advantage's active work lanes in a friendly view: what is being assessed, what is waiting on records, what is ready for decision.",
  "Surface exceptions: margin drop, missed follow-up, exposed contract, stuck applicant, unpaid invoice.",
  "Let Heather point attention where the next decision matters, not where the loudest fire is.",
];

const decisionGates = [
  "Can the line stand on clean books and its own margin?",
  "Does it deepen Tropical's existing client relationships?",
  "Can the current crew deliver it without breaking the base?",
  "Does it create recurring revenue or strategic proof?",
  "Does it free Heather's attention instead of consuming it?",
];

const hospitalityLanes = [
  "Hotels and accommodation staffing",
  "Restaurant, food and beverage teams",
  "Stadium and event staffing",
  "Theater and venue concession support",
  "Government and institutional hospitality contracts",
  "Crisis housekeeping and deep cleaning",
  "Business staffing and admin support",
  "Merge showroom: private events, consulting, catering, activations, and client-space operations",
];

const ownerFocus = [
  "Which accounts should I personally pursue?",
  "Where is money leaking this week?",
  "Which entity or market is carrying the weight?",
  "Which crew member or manager owns the fix?",
  "Which clients are profitable enough to expand?",
  "Which leads or applicants are stuck?",
  "What can wait because it is not owner-critical?",
];

const activeFoundation = [
  {
    title: "Grounding agreement",
    status: "Signed",
    text: "Bookkeeping, assessment, records review, and the first operating visibility layer are now the immediate working lane.",
  },
  {
    title: "Books and cash picture",
    status: "In motion",
    text: "Reconcile what is really happening across the core business and Merge so profit, losses, and internal funding flows become visible.",
  },
  {
    title: "Entity, tax, and state presence",
    status: "Assessment",
    text: "Clarify where operations, payroll, taxable presence, insurance, and entity structure need to be tightened before larger growth.",
  },
  {
    title: "MWBE certification readiness",
    status: "Starting",
    text: "Organize owner, entity, payroll, tax, and operating records for minority and woman-owned business certification work.",
  },
  {
    title: "Growth opportunity map",
    status: "Discovery",
    text: "Evaluate contracts, hospitality clients, venue lanes, Merge halo services, and government/institutional pathways without overcommitting too early.",
  },
];

const dossierNav = [
  { href: "#overview", label: "Overview" },
  { href: "#foundation", label: "Foundation" },
  { href: "#structure", label: "Structure" },
  { href: "#client-room", label: "Client room" },
  { href: "#assets", label: "Assets" },
  { href: "#market", label: "Market" },
  { href: "#stack", label: "Stack" },
  { href: "#cockpit", label: "Cockpit" },
  { href: "#next", label: "Next" },
];

function normalizeAccessCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function accessFromLocation() {
  if (typeof window === "undefined") return false;
  const hash = normalizeAccessCode(window.location.hash.replace("#", ""));
  const query = normalizeAccessCode(new URLSearchParams(window.location.search).get("code") ?? "");
  return ACCESS_CODES.has(hash) || ACCESS_CODES.has(query);
}

export function TropicalStarsDossier() {
  const [unlocked, setUnlocked] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [displayName, setDisplayName] = useState("Tropical Stars");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const navRailRef = useRef<HTMLDivElement>(null);
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
    const savedName = window.localStorage.getItem("ts-dossier-name")?.trim();
    if (savedName) {
      setRecipientName(savedName);
      setDisplayName(savedName);
    }
    if (accessFromLocation() || window.localStorage.getItem("ts-dossier-access") === "granted") {
      setUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (!unlocked) return;

    const sectionIds = dossierNav.map((item) => item.href.slice(1));
    let frame = 0;

    function updateActiveSection() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const viewportAnchor = 190;
        let current = sectionIds[0];

        for (const id of sectionIds) {
          const section = document.getElementById(id);
          if (!section) continue;
          if (section.getBoundingClientRect().top <= viewportAnchor) {
            current = id;
          }
        }

        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
          current = sectionIds[sectionIds.length - 1];
        }

        setActiveSection(current);
      });
    }

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [unlocked]);

  useEffect(() => {
    if (!unlocked) return;
    const rail = navRailRef.current;
    const active = rail?.querySelector<HTMLAnchorElement>(`[data-section="${activeSection}"]`);
    active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeSection, unlocked]);

  function submitAccess(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = recipientName.trim();
    if (!name) {
      setError("Enter your name to continue.");
      return;
    }
    const normalized = normalizeAccessCode(code);
    if (ACCESS_CODES.has(normalized)) {
      window.localStorage.setItem("ts-dossier-access", "granted");
      window.localStorage.setItem("ts-dossier-name", name);
      setDisplayName(name);
      setUnlocked(true);
      setError("");
      return;
    }
    setError("Access code not recognized.");
  }

  function handleNavClick(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;
    const offset = 150;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    window.history.replaceState(null, "", href);
  }

  if (!unlocked) {
    return (
      <main className="min-h-screen overflow-hidden bg-[#f5efe4] text-[#211b14]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_8%,rgba(176,142,91,0.22),transparent_34%),radial-gradient(circle_at_12%_82%,rgba(31,97,69,0.14),transparent_38%)]" />
        <section className="relative z-10 flex min-h-screen items-center justify-center px-5">
          <form
            onSubmit={submitAccess}
            className="w-full max-w-[480px] rounded-[18px] border border-[#d8cbb8] bg-[#fffdf8] p-5 shadow-[0_28px_70px_-36px_rgba(59,45,25,0.55)] sm:p-7"
          >
            <div className="relative mb-6 overflow-hidden rounded-[16px] border border-[#d8cbb8] bg-[#211b14]">
              <Image
                src="/images/tropical-stars/foundation-growth-art.png"
                alt="Abstract foundation and hospitality growth visual"
                width={1672}
                height={941}
                priority
                className="h-40 w-full object-cover object-[62%_50%] sm:h-48"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#211b14]/82 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-white/15 bg-[#211b14]/72 px-4 py-3 text-[#f6f0e6] backdrop-blur-md">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#d7bd89]">
                  Mobile private entry
                </div>
                <p className="mt-1 text-xs font-semibold leading-5">
                  Opens cleanly on phone. Best reviewed on desktop for the full boardroom view.
                </p>
              </div>
            </div>
            <div className="mb-8 inline-flex rounded-2xl border border-[#3d3021] bg-[#211b14] px-5 py-4 shadow-[0_18px_42px_-28px_rgba(20,14,8,0.65)]">
              <Image
                src="/images/tropical-stars-logo.png"
                alt="Tropical Stars Talent Solutions"
                width={192}
                height={90}
                priority
                className="h-auto w-44 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
              />
            </div>
            <div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.22em] text-[#98743f]">
              <LockKeyhole className="h-4 w-4" />
              Private Growth Dossier
            </div>
            <h1 className="font-[family-name:var(--font-dossier-serif)] text-[2rem] font-semibold leading-none tracking-tight text-[#211b14]">
              Prepared for Tropical Stars.
            </h1>
            <p className="mt-4 text-sm leading-6 text-[#6f6557]">
              Confidential Advantage Services operating memo. Enter your name
              and private code to continue.
            </p>
            <label htmlFor="recipient-name" className="mt-7 block text-xs font-bold uppercase tracking-[0.18em] text-[#7a6b57]">
              Recipient
            </label>
            <input
              id="recipient-name"
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#d8cbb8] bg-[#f7f2e8] px-4 py-3 text-sm font-semibold text-[#211b14] outline-none transition placeholder:text-[#a59a8b] focus:border-[#a77d42] focus:ring-4 focus:ring-[#ead9bb]"
              placeholder="Heather"
              autoComplete="name"
            />
            <label htmlFor="access-code" className="mt-5 block text-xs font-bold uppercase tracking-[0.18em] text-[#7a6b57]">
              Private access code
            </label>
            <input
              id="access-code"
              type="password"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#d8cbb8] bg-[#f7f2e8] px-4 py-3 font-mono text-sm tracking-[0.12em] text-[#211b14] outline-none transition focus:border-[#a77d42] focus:ring-4 focus:ring-[#ead9bb]"
              placeholder="TS-growth"
              autoComplete="off"
              spellCheck={false}
            />
            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#9f7a45] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#866435]">
              Enter private dossier
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
    <main className="dossier-motion min-h-screen bg-[#f6f0e6] text-[#211b14]">
      <style>{`
        .dossier-motion .float-panel{animation:tsFloat 9s ease-in-out infinite;transform-style:preserve-3d}
        .dossier-motion .float-panel:nth-child(2){animation-delay:-2s}
        .dossier-motion .glass-line{animation:tsGlide 8s ease-in-out infinite}
        .dossier-motion .reveal-card{animation:tsReveal .72s cubic-bezier(.2,.7,.2,1) both}
        .dossier-motion .reveal-card:nth-child(2){animation-delay:.08s}
        .dossier-motion .reveal-card:nth-child(3){animation-delay:.16s}
        .dossier-motion .reveal-card:nth-child(4){animation-delay:.24s}
        .dossier-motion .lift-card{transition:transform .28s cubic-bezier(.2,.7,.2,1), box-shadow .28s cubic-bezier(.2,.7,.2,1)}
        .dossier-motion .lift-card:hover{transform:translateY(-6px) rotateX(1.5deg);box-shadow:0 30px 70px -46px rgba(39,29,16,.72)}
        .dossier-motion .cinema-panel{isolation:isolate}
        .dossier-motion .cinema-panel:before{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 0%,rgba(216,188,126,.12) 34%,transparent 52%);transform:translateX(-72%);animation:tsSweep 10s ease-in-out infinite;z-index:-1}
        .dossier-motion .signal-chip{transition:transform .24s cubic-bezier(.2,.7,.2,1),border-color .24s,background-color .24s}
        .dossier-motion .signal-chip:hover{transform:translateY(-3px);border-color:#b99a66;background-color:#33291c}
        .dossier-motion .pulse-node{animation:tsPulse 2.8s ease-in-out infinite}
        .dossier-motion .art-drift{animation:tsArtDrift 13s ease-in-out infinite;transform-origin:center}
        .dossier-motion .dossier-anchor{scroll-margin-top:11.5rem}
        @media (min-width:768px){
          .dossier-motion .story-rail:before{content:"";position:absolute;left:1.45rem;right:1.45rem;top:2.35rem;height:1px;background:linear-gradient(90deg,rgba(15,90,67,.18),rgba(159,122,69,.82),rgba(15,90,67,.18))}
          .dossier-motion .story-rail:after{content:"";position:absolute;left:1.45rem;top:2.35rem;height:1px;width:32%;background:#0f5a43;box-shadow:0 0 28px rgba(15,90,67,.36);animation:tsRail 6.5s ease-in-out infinite}
        }
        @keyframes tsFloat{0%,100%{transform:translate3d(0,0,0) rotateX(0deg)}50%{transform:translate3d(0,-8px,0) rotateX(1.2deg)}}
        @keyframes tsGlide{0%,100%{transform:translateX(-12%);opacity:.38}50%{transform:translateX(12%);opacity:.72}}
        @keyframes tsReveal{from{transform:translateY(18px) scale(.985)}to{transform:translateY(0) scale(1)}}
        @keyframes tsSweep{0%,35%{transform:translateX(-72%)}60%,100%{transform:translateX(72%)}}
        @keyframes tsPulse{0%,100%{box-shadow:0 0 0 0 rgba(15,90,67,.22)}50%{box-shadow:0 0 0 10px rgba(15,90,67,0)}}
        @keyframes tsRail{0%,100%{transform:translateX(0);opacity:.45}50%{transform:translateX(196%);opacity:.9}}
        @keyframes tsArtDrift{0%,100%{transform:scale(1.01) translate3d(0,0,0)}50%{transform:scale(1.045) translate3d(-8px,-4px,0)}}
        @media (prefers-reduced-motion: reduce){
          .dossier-motion .float-panel,.dossier-motion .glass-line,.dossier-motion .reveal-card,.dossier-motion .cinema-panel:before,.dossier-motion .pulse-node,.dossier-motion .story-rail:after,.dossier-motion .art-drift{animation:none}
          .dossier-motion .lift-card,.dossier-motion .lift-card:hover{transition:none;transform:none}
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_82%_6%,rgba(171,135,78,0.18),transparent_31%),radial-gradient(circle_at_8%_45%,rgba(22,90,65,0.10),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.52),rgba(255,255,255,0))]" />
      <header className="sticky top-0 z-40 border-b border-[#e1d4c0] bg-[#f6f0e6]/86 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5 sm:px-8">
          <div className="flex items-center self-center rounded-xl border border-[#3d3021] bg-[#211b14] px-3 py-1.5 shadow-sm">
            <Image
              src="/images/tropical-stars-logo.png"
              alt="Tropical Stars Talent Solutions"
              width={192}
              height={90}
              priority
              className="h-9 w-auto drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
            />
          </div>
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
            Prepared for {displayName} / {preparedDate}
          </div>
        </div>
      </header>

      <nav className="sticky top-16 z-30 border-b border-[#e5d8c4] bg-[#f6f0e6]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-3 sm:px-8">
          <div className="hidden shrink-0 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#98743f] md:block">
            Dossier map
          </div>
          <div ref={navRailRef} className="flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {dossierNav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                data-section={item.href.slice(1)}
                aria-current={activeSection === item.href.slice(1) ? "true" : undefined}
                onClick={(event) => handleNavClick(event, item.href)}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.12em] shadow-sm transition ${
                  activeSection === item.href.slice(1)
                    ? "border-[#8f6831] bg-[#211b14] text-[#f6f0e6] shadow-[0_12px_30px_-18px_rgba(39,29,16,0.75)]"
                    : "border-[#d8cbb8] bg-[#fffdf8] text-[#5f564b] hover:border-[#a77d42] hover:text-[#211b14]"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <section id="overview" className="dossier-anchor relative z-10 mx-auto grid max-w-7xl gap-8 px-5 pb-12 pt-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-16 lg:pt-14">
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
            help the company grow on a different scale: protect the people,
            make Merge financially legible, firm the foundation, and give
            ownership the visibility to pursue the accounts and partnerships
            that can carry a 3x company.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["Grounding phase signed", "Protect the people", "Tighten the house", "3x growth path"].map((item) => (
              <span key={item} className="rounded-full border border-[#d8cbb8] bg-[#fffdf8] px-4 py-2 text-sm font-bold text-[#4f463b] shadow-sm">
                {item}
              </span>
            ))}
          </div>
          <div className="relative mt-7 overflow-hidden rounded-[20px] border border-[#d8cbb8] bg-[#211b14] shadow-[0_28px_80px_-54px_rgba(39,29,16,0.72)]">
            <Image
              src="/images/tropical-stars/foundation-growth-art.png"
              alt="Abstract foundation and hospitality growth visual"
              width={1672}
              height={941}
              priority
              className="art-drift h-56 w-full object-cover object-[62%_50%] sm:h-72"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#211b14]/84 via-[#211b14]/18 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 max-w-md rounded-2xl border border-white/15 bg-[#211b14]/72 p-4 text-[#f6f0e6] backdrop-blur-md">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#d7bd89]">
                Mobile-ready private room
              </div>
              <p className="mt-2 text-sm font-semibold leading-6">
                Send by WhatsApp. For the full strategy-room experience, open the same link on desktop.
              </p>
            </div>
          </div>
        </div>

        <aside className="float-panel relative overflow-hidden rounded-[18px] border border-[#d8cbb8] bg-[#fffdf8] p-5 shadow-[0_30px_90px_-54px_rgba(39,29,16,0.72)] sm:p-7">
          <div className="glass-line pointer-events-none absolute left-8 right-8 top-16 h-px bg-gradient-to-r from-transparent via-[#b99a66] to-transparent" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#98743f]">
                Owner leverage
              </div>
              <h2 className="mt-3 font-[family-name:var(--font-dossier-serif)] text-3xl font-semibold leading-tight">
                Give ownership a calm room to see what matters.
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
          <div className="mt-5 grid grid-cols-3 gap-2">
            {["NY", "TN", "GA"].map((state) => (
              <div key={state} className="rounded-xl border border-[#e5dac9] bg-[#f6f0e6] px-3 py-2 text-center">
                <div className="font-[family-name:var(--font-dossier-serif)] text-xl font-semibold text-[#9f7a45]">{state}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a6b57]">market</div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid overflow-hidden rounded-[18px] border border-[#d8cbb8] bg-[#fffdf8] shadow-[0_18px_60px_-42px_rgba(39,29,16,0.55)] sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <div key={metric.label} className={`p-6 ${index < metrics.length - 1 ? "border-b border-[#e6dac7] sm:border-r lg:border-b-0" : ""}`}>
              <div className="font-[family-name:var(--font-dossier-serif)] text-[clamp(1.85rem,8vw,2.55rem)] font-semibold leading-none text-[#211b14] sm:whitespace-nowrap">
                {metric.value}
              </div>
              <div className="mt-3 text-sm font-semibold leading-5 text-[#6f6557]">{metric.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="foundation" className="dossier-anchor relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="max-w-xl">
            <div className="mb-4 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#916b32]">
              <HeartHandshake className="h-4 w-4" />
              Founder priorities
            </div>
            <h2 className="font-[family-name:var(--font-dossier-serif)] text-[clamp(2.35rem,5vw,4.7rem)] font-semibold leading-[0.96] tracking-tight">
              Protect the people. Strengthen the house. Scale what works.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#6f6557]">
              The strategy should meet Tropical where the pressure is real:
              people depend on the business, and Merge carries real founder
              energy. The preliminary grounding phase is the first step: make
              the house firm enough that the people, the assets, and the growth
              plan can move together.
            </p>
            <div className="relative mt-7 overflow-hidden rounded-[18px] border border-[#d8cbb8] bg-[#211b14] shadow-[0_24px_70px_-48px_rgba(39,29,16,0.68)]">
              <Image
                src="/images/tropical-stars/crew-care-art.png"
                alt="Premium hospitality operations station"
                width={1672}
                height={941}
                className="art-drift h-52 w-full object-cover object-[64%_50%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#211b14]/78 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-sm font-semibold leading-6 text-[#f6f0e6]">
                Care becomes scalable when the operating room is calm, clear, and repeatable.
              </div>
            </div>
          </div>
          <div className="story-rail relative grid gap-4 rounded-[22px] border border-[#d8cbb8] bg-[#fffdf8] p-5 shadow-[0_28px_90px_-58px_rgba(39,29,16,0.65)] md:grid-cols-3 md:p-7">
            {founderPriorities.map((priority, index) => (
              <article key={priority.title} className="reveal-card lift-card relative rounded-[18px] border border-[#e6dac7] bg-[#f8f3ea] p-5">
                <div className="pulse-node relative z-10 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e4efe6] text-[#0f5a43]">
                  <span className="font-[family-name:var(--font-dossier-serif)] text-xl font-semibold">0{index + 1}</span>
                </div>
                <div className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#98743f]">{priority.eyebrow}</div>
                <h3 className="mt-3 font-[family-name:var(--font-dossier-serif)] text-2xl font-semibold leading-tight">
                  {priority.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-[#5f564b]">{priority.text}</p>
              </article>
            ))}
          </div>
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
            <article key={item.step} className="lift-card reveal-card rounded-[18px] border border-[#d8cbb8] bg-[#fffdf8] p-5">
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
            <article key={phase.title} className="lift-card reveal-card group rounded-[18px] border border-[#d8cbb8] bg-[#fffdf8] p-6">
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

      <section id="structure" className="dossier-anchor relative z-10 mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:pb-20">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="cinema-panel float-panel relative overflow-hidden rounded-[22px] border border-[#3d3021] bg-[#211b14] p-7 text-[#f6f0e6] shadow-[0_34px_110px_-54px_rgba(20,14,8,0.82)]">
            <div className="glass-line pointer-events-none absolute left-8 right-8 top-20 h-px bg-gradient-to-r from-transparent via-[#b99a66] to-transparent" />
            <div className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#d7bd89]">
              Visibility and structure
            </div>
            <h2 className="mt-5 font-[family-name:var(--font-dossier-serif)] text-[clamp(2.2rem,4.8vw,4.5rem)] font-semibold leading-[0.96]">
              The money may be there. The picture is not clear enough yet.
            </h2>
            <p className="mt-6 text-sm leading-7 text-[#efe4d3]">
              When the founder feels there should be more money, the answer is
              not only a bank balance. It is entity clarity, state clarity,
              coverage clarity, and a clean view of which business line is
              funding which ambition. The signed grounding phase turns that
              confusion into usable fuel.
            </p>
            <div className="mt-7 grid gap-2 sm:grid-cols-3">
              {["Structure", "Presence", "Attention"].map((label) => (
                <div key={label} className="rounded-2xl border border-[#5d4c34] bg-[#18130e] p-3 text-center">
                  <div className="font-[family-name:var(--font-dossier-serif)] text-[1.65rem] font-semibold leading-none text-[#d7bd89] sm:text-2xl">
                    {label}
                  </div>
                  <div className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#bfa673]">
                    growth carrier
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {structureInsights.map((item) => (
              <article key={item.title} className="lift-card reveal-card rounded-[18px] border border-[#d8cbb8] bg-[#fffdf8] p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e4efe6] text-[#0f5a43]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#98743f]">
                      Preparedness lane
                    </div>
                    <h3 className="mt-2 font-[family-name:var(--font-dossier-serif)] text-2xl font-semibold leading-tight">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#6f6557]">{item.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="mt-6 rounded-[18px] border border-[#d8cbb8] bg-[#f8f3ea] p-5 text-sm font-semibold leading-7 text-[#4f463b]">
          Advantage does not need to overpromise a tax answer in the room. The
          stronger promise is process: reconcile the books, map the entities,
          clarify the states, align insurance coverage, and prepare the company
          so valuation and trust planning can rest on clean facts.
        </div>
      </section>

      <section id="client-room" className="dossier-anchor relative z-10 mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:pb-20">
        <div className="grid gap-8 rounded-[24px] border border-[#d8cbb8] bg-[#fffdf8] p-5 shadow-[0_28px_90px_-58px_rgba(39,29,16,0.65)] sm:p-7 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="cinema-panel float-panel relative overflow-hidden rounded-[20px] border border-[#3d3021] bg-[#211b14] p-7 text-[#f6f0e6]">
            <div className="glass-line pointer-events-none absolute left-8 right-8 top-20 h-px bg-gradient-to-r from-transparent via-[#b99a66] to-transparent" />
            <div className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#d7bd89]">
              Private client room
            </div>
            <h2 className="mt-5 font-[family-name:var(--font-dossier-serif)] text-[clamp(2.15rem,4.6vw,4.4rem)] font-semibold leading-[0.95]">
              A friendly window into the work already moving.
            </h2>
            <p className="mt-6 text-sm leading-7 text-[#efe4d3]">
              The goal is not to hand Heather a taskboard to manage. It is to
              give her a clear, private view of what Advantage is organizing:
              what is being grounded, what is waiting on documents, what is
              ready for decision, and what may become a growth lane.
            </p>
            <div className="mt-6 rounded-2xl border border-[#5d4c34] bg-[#18130e] p-4">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#bfa673]">
                First operating signal
              </div>
              <p className="mt-2 font-[family-name:var(--font-dossier-serif)] text-2xl font-semibold leading-tight text-[#d7bd89]">
                Signed grounding phase: books, assessment, structure, and certification readiness.
              </p>
            </div>
          </div>
          <div className="grid gap-3">
            {activeFoundation.map((item, index) => (
              <article key={item.title} className="lift-card reveal-card rounded-[18px] border border-[#e6dac7] bg-[#f8f3ea] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#98743f]">
                      Work lane 0{index + 1}
                    </div>
                    <h3 className="mt-2 font-[family-name:var(--font-dossier-serif)] text-2xl font-semibold leading-tight">
                      {item.title}
                    </h3>
                  </div>
                  <span className="rounded-full border border-[#d9c7a9] bg-[#fffdf8] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7d5b28]">
                    {item.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#6f6557]">{item.text}</p>
              </article>
            ))}
          </div>
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

      <section id="assets" className="dossier-anchor relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <SectionHeader
          eyebrow="Footprint and flagship"
          title="Tropical has more than one growth asset. Merge is one important signal."
          text="The meeting should not over-focus on one restaurant. Tropical already has people, client relationships, market reach, and a founder-led flagship asset. Advantage's role is to make the foundation clear enough that each asset can be evaluated, protected, and turned into the right growth lane."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {growthAssets.map((asset) => (
            <article key={asset.title} className="lift-card reveal-card rounded-[18px] border border-[#d8cbb8] bg-[#fffdf8] p-5">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#98743f]">Growth asset</div>
              <h3 className="mt-3 font-[family-name:var(--font-dossier-serif)] text-2xl font-semibold leading-tight">{asset.title}</h3>
              <p className="mt-4 text-sm leading-6 text-[#6f6557]">{asset.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-9 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-4">
            {footprint.map((item) => (
              <article key={item.market} className="lift-card reveal-card rounded-[18px] border border-[#d8cbb8] bg-[#fffdf8] p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e4efe6] text-[#0f5a43]">
                    <MapPinned className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-[family-name:var(--font-dossier-serif)] text-2xl font-semibold">{item.market}</div>
                    <div className="mt-1 text-xs font-extrabold uppercase tracking-[0.18em] text-[#98743f]">{item.status}</div>
                    <p className="mt-3 text-sm leading-6 text-[#6f6557]">{item.note}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <article className="cinema-panel float-panel relative overflow-hidden rounded-[22px] border border-[#3d3021] bg-[#211b14] p-7 text-[#f6f0e6] shadow-[0_34px_110px_-54px_rgba(20,14,8,0.92)]">
            <div className="glass-line pointer-events-none absolute left-8 right-8 top-20 h-px bg-gradient-to-r from-transparent via-[#b99a66] to-transparent" />
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#473823] text-[#d7bd89]">
                <UtensilsCrossed className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#d7bd89]">Merge flagship</div>
                <h3 className="mt-3 font-[family-name:var(--font-dossier-serif)] text-3xl font-semibold leading-tight">
                  The flagship can make Tropical feel larger before the org chart gets larger.
                </h3>
              </div>
            </div>
            <div className="mt-6 inline-flex rounded-full border border-[#5d4c34] bg-[#18130e] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#d7bd89]">
              Crown jewel to showroom to profitable formats
            </div>
            <p className="mt-6 text-sm leading-7 text-[#efe4d3]">
              Merge is not another American restaurant in a crowded category.
              It is a visible stage for premium Caribbean hospitality: taste,
              room, service, invitation, and follow-up. Advantage can help make
              the economics legible enough that ownership can see what is
              working, what is being funded by the wider business, and where the
              flagship might create growth beyond table service.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {mergeSignals.map((signal) => (
                <div key={signal.label} className="signal-chip rounded-2xl border border-[#5d4c34] bg-[#2a2319] p-4">
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#d7bd89]">{signal.label}</div>
                  <p className="mt-2 text-sm leading-6 text-[#efe4d3]">{signal.text}</p>
                </div>
              ))}
            </div>
            <ul className="mt-6 grid gap-3">
              {flagshipMoves.map((move) => (
                <li key={move} className="flex gap-3 rounded-xl border border-[#5d4c34] bg-[#18130e] p-3 text-sm font-semibold leading-6 text-[#f6f0e6]">
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#d7bd89]" />
                  {move}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section id="market" className="dossier-anchor relative z-10 mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:pb-20">
        <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="cinema-panel float-panel relative overflow-hidden rounded-[24px] border border-[#3d3021] bg-[#211b14] p-7 text-[#f6f0e6] shadow-[0_34px_110px_-58px_rgba(20,14,8,0.82)] sm:p-9">
            <div className="glass-line pointer-events-none absolute left-8 right-8 top-24 h-px bg-gradient-to-r from-transparent via-[#b99a66] to-transparent" />
            <div className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#d7bd89]">
              Market context, not projections
            </div>
            <h2 className="mt-5 font-[family-name:var(--font-dossier-serif)] text-[clamp(2.25rem,5vw,4.65rem)] font-semibold leading-[0.94]">
              Merge can show the standard Tropical can bring into other rooms.
            </h2>
            <p className="mt-6 text-sm leading-7 text-[#efe4d3]">
              These are outside market signals. They frame where opportunity
              may exist; they are not Tropical targets or Advantage promises.
              The right move is to choose only the lanes that can be served
              well, priced clearly, insured properly, and run without pulling
              the owner back into every detail.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {marketSignals.map((signal) => (
                <div key={signal.label} className="rounded-2xl border border-[#5d4c34] bg-[#18130e] p-4">
                  <div className="break-words font-[family-name:var(--font-dossier-serif)] text-[clamp(2.25rem,12vw,3rem)] font-semibold leading-[0.95] text-[#d7bd89] sm:text-3xl">
                    {signal.value}
                  </div>
                  <div className="mt-2 text-xs font-bold leading-5 text-[#efe4d3]">{signal.label}</div>
                  <div className="mt-2 text-[10px] font-extrabold uppercase leading-5 tracking-[0.1em] text-[#bfa673] sm:tracking-[0.16em]">{signal.source}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#d8cbb8] bg-[#fffdf8] p-4 shadow-[0_24px_80px_-56px_rgba(39,29,16,0.65)] sm:p-5">
            <div className="grid gap-4 md:grid-cols-2">
              {marketBackedLanes.map((lane) => (
                <article key={lane.title} className="lift-card reveal-card rounded-[18px] border border-[#e6dac7] bg-[#f8f3ea] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e4efe6] text-[#0f5a43]">
                      <lane.icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-[#d9c7a9] bg-[#fffdf8] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7d5b28]">
                      {lane.score}
                    </span>
                  </div>
                  <div className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#98743f]">
                    {lane.thesis}
                  </div>
                  <h3 className="mt-3 font-[family-name:var(--font-dossier-serif)] text-2xl font-semibold leading-tight">
                    {lane.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-[#6f6557]">{lane.text}</p>
                  <div className="mt-5 rounded-2xl border border-[#e0d2bd] bg-[#fffdf8] p-4">
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#98743f]">
                      First proof
                    </div>
                    <p className="mt-2 text-xs font-semibold leading-5 text-[#4f463b]">{lane.pilot}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-3 rounded-[22px] border border-[#d8cbb8] bg-[#f8f3ea] p-5 md:grid-cols-5">
          {decisionGates.map((gate, index) => (
            <div key={gate} className="rounded-2xl border border-[#e3d5c1] bg-[#fffdf8] p-4">
              <div className="font-[family-name:var(--font-dossier-serif)] text-2xl font-semibold text-[#b49765]">0{index + 1}</div>
              <p className="mt-2 text-xs font-bold leading-5 text-[#4f463b]">{gate}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="stack" className="dossier-anchor relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <SectionHeader
          eyebrow="Advantage operating stack"
          title="How Advantage turns foresight into execution."
          text="This is not a report that gets left behind. It is the operating layer: books, compliance, owner visibility, growth pipeline, and weekly decisions moving in one cadence."
        />
        <div className="cinema-panel float-panel relative mt-9 overflow-hidden rounded-[22px] border border-[#3d3021] bg-[#211b14] p-6 text-[#f6f0e6] shadow-[0_30px_90px_-58px_rgba(20,14,8,0.82)] sm:p-7 lg:ml-auto lg:max-w-5xl lg:-rotate-1">
          <div className="absolute inset-y-0 right-0 hidden w-[38%] opacity-60 lg:block">
            <Image
              src="/images/tropical-stars/certification-growth-art.png"
              alt="Abstract certification readiness visual"
              width={1672}
              height={941}
              className="h-full w-full object-cover object-[62%_50%]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#211b14] via-[#211b14]/76 to-transparent" />
          </div>
          <div className="glass-line pointer-events-none absolute left-8 right-8 top-16 h-px bg-gradient-to-r from-transparent via-[#b99a66] to-transparent" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#d7bd89]">
                <ClipboardCheck className="h-4 w-4" />
                Certification unlock
              </div>
              <h3 className="mt-4 font-[family-name:var(--font-dossier-serif)] text-3xl font-semibold leading-tight sm:text-4xl">
                MWBE certification readiness
              </h3>
              <p className="mt-4 text-sm leading-7 text-[#efe4d3]">
                Minority and woman-owned certification opens bid paths,
                set-aside contracts, and institutional accounts that stay
                closed without it. We organize the owner, entity, payroll, tax,
                and operating records so the certification, and the work behind
                it, is within reach.
              </p>
            </div>
            <div className="rounded-2xl border border-[#5d4c34] bg-[#18130e] px-5 py-4 lg:w-56">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#bfa673]">
                Strategic use
              </div>
              <p className="mt-2 font-[family-name:var(--font-dossier-serif)] text-2xl font-semibold leading-tight text-[#d7bd89]">
                Qualify for work that is not available to everyone.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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
            The 3x path
          </div>
          <div className="mt-7 space-y-5">
            <TrajectoryRow icon={SearchCheck} label="Control leakage" text="No growth plan works if profit, follow-up, billing, or compliance leaks stay invisible." />
            <TrajectoryRow icon={ClipboardCheck} label="Standardize delivery" text="Crew and managers get repeatable checklists, visible ownership, and fewer handoff failures." />
            <TrajectoryRow icon={Handshake} label="Win larger accounts" text="Owner attention shifts toward hotels, venues, events, airport-adjacent operators, and strategic partners." />
            <TrajectoryRow icon={CalendarCheck} label="Run the cadence" text="Weekly growth and operations review turns data into decisions, not more cleanup work." />
          </div>
        </div>
      </section>

      <section id="cockpit" className="dossier-anchor relative z-10 mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:pb-20">
        <div className="grid overflow-hidden rounded-[24px] border border-[#3d3021] bg-[#211b14] text-[#f6f0e6] shadow-[0_34px_110px_-58px_rgba(20,14,8,0.8)] lg:grid-cols-[0.82fr_1.18fr]">
          <div className="cinema-panel relative p-7 sm:p-9">
            <div className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#d7bd89]">
              Owner attention cockpit
            </div>
            <h2 className="mt-5 font-[family-name:var(--font-dossier-serif)] text-[clamp(2.2rem,4.8vw,4.5rem)] font-semibold leading-[0.96]">
              Not another CRM. One place to know where attention belongs.
            </h2>
            <p className="mt-6 text-sm leading-7 text-[#efe4d3]">
              Merge may have its own POS and restaurant tools. Tropical may have
              staffing, payroll, client, and bid tools. The owner layer should
              sit above them: fewer dashboards, cleaner exceptions, and a weekly
              decision view across the whole business.
            </p>
            <div className="mt-7 rounded-2xl border border-[#5d4c34] bg-[#18130e] p-4">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#bfa673]">
                Owner promise
              </div>
              <p className="mt-2 font-[family-name:var(--font-dossier-serif)] text-2xl font-semibold leading-tight text-[#d7bd89]">
                See the business in time to choose the next move.
              </p>
            </div>
          </div>
          <div className="grid gap-3 border-t border-[#4c3d2b] bg-[#2a2319] p-5 sm:p-7 lg:border-l lg:border-t-0">
            {ownerCockpit.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-[#5d4c34] bg-[#18130e] p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#d7bd89]" />
                <span className="text-sm font-semibold leading-6 text-[#efe4d3]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="next" className="dossier-anchor relative z-10 mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="rounded-[20px] border border-[#0f5a43]/25 bg-[#dfece3] p-7 sm:p-9 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#0f5a43]">
              Recommended direction
            </div>
            <h2 className="mt-4 font-[family-name:var(--font-dossier-serif)] text-3xl font-semibold leading-tight sm:text-5xl">
              Start the grounding phase, then choose the growth lanes together.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[#3f5147]">
              Advantage Services represents the full foundation: books, tax,
              insurance, compliance, entity posture, certification readiness,
              reporting, operating rhythm, and growth discipline. The signed
              preliminary agreement gives us the first lane: tighten the house
              and make the truth visible. From there, Tropical and Advantage can
              decide which growth possibilities, valuation moves, and
              trust-planning steps deserve investment.
            </p>
          </div>
          <div className="mt-7 shrink-0 rounded-2xl border border-[#b7d0bd] bg-[#fffdf8] p-5 lg:mt-0 lg:w-80">
            <div className="text-sm font-extrabold text-[#0f5a43]">Next working session</div>
            <p className="mt-2 text-sm leading-6 text-[#4f463b]">
              Name the first diagnostics, identify the first leakage targets,
              map the entity, state, insurance, and certification questions,
              and use the findings to choose the growth lanes that are real
              enough to pursue.
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
