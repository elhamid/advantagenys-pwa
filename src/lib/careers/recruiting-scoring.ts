import type { CareerApplicationPayload } from "./product-engineering-associate";

/**
 * Deterministic qualification + defect-match scoring for the Junior Product
 * Engineering Associate funnel.
 *
 * Replaces the prior length/keyword heuristic. Scoring is 100% deterministic
 * (no LLM, no network) so it stays inside the AI-cost due-diligence rule. The
 * structure intentionally separates the three concerns so an LLM grader can be
 * added LATER behind a flag without rewiring the route:
 *   - HARD GATES  -> gateResult()        (pass/fail, caps the tier)
 *   - DEFECT MATCH -> scoreDefectMatch()  (real signal vs planted bugs)
 *   - SIGNALS     -> scoreSignals()       (completeness / artifacts / honesty)
 *
 * `gradeWithLlm` is a reserved no-op seam: a future flag-gated grader returns a
 * refinement that is merged into `breakdown.llm`. It does nothing today.
 */

// ---------------------------------------------------------------------------
// GROUND TRUTH — the planted defects in sample/SampleQuoteFlow.tsx.
// Each defect has match patterns over the candidate's own free-text. A defect
// counts as "found" when ANY of its patterns appears in the combined answer
// text. Keep these in sync with the sample exercise.
// ---------------------------------------------------------------------------

export interface PlantedDefect {
  id: string;
  label: string;
  /** Regexes (case-insensitive) — any match means the candidate caught it. */
  patterns: RegExp[];
}

export const PLANTED_DEFECTS: PlantedDefect[] = [
  {
    id: "channel_mismatch",
    label: "Channel mismatch: scenario promises WhatsApp, confirmation says email",
    patterns: [
      /whatsapp[^.]{0,40}email|email[^.]{0,40}whatsapp/i,
      /channel\s*mismatch/i,
      /(promis|said|expect)[^.]{0,30}whatsapp/i,
      /confirmation[^.]{0,40}email/i,
      /wrong\s*channel/i,
    ],
  },
  {
    id: "phone_validation",
    label: "Phone field has no validation (accepts letters/garbage)",
    patterns: [
      /phone[^.]{0,40}(no|without|lacks|missing|isn'?t|not)\s*valid/i,
      /(no|missing|lacks)[^.]{0,20}phone[^.]{0,20}valid/i,
      /phone[^.]{0,40}(accept|allow)[^.]{0,20}(letter|text|garbage|anything|alpha)/i,
      /(letter|alpha|text)[^.]{0,30}phone/i,
      /phone[^.]{0,30}validation/i,
    ],
  },
  {
    id: "submit_below_fold",
    label: "Submit button pushed below the fold on mobile / selected service not echoed",
    patterns: [
      /below[\s-]*the[\s-]*fold/i,
      /(submit|cta|button)[^.]{0,40}(below|off|hidden|scroll)/i,
      /(scroll|hidden)[^.]{0,40}(submit|cta|button)/i,
      /service[^.]{0,40}(not\s*echo|not\s*shown|not\s*displayed|not\s*confirmed|no\s*confirmation)/i,
      /tall[^.]{0,30}(stack|card|list)/i,
    ],
  },
  {
    id: "prefilled_referral",
    label: "Referral code is prefilled and editable (data integrity risk)",
    patterns: [
      /referral[^.]{0,40}(prefill|pre-fill|pre fill|editable|already filled|default)/i,
      /(prefill|pre-fill|editable|default)[^.]{0,30}referral/i,
      /jkh-?2026/i,
      /referral[^.]{0,40}(can\s*be\s*chang|user\s*can\s*edit|overwrit)/i,
    ],
  },
  {
    id: "nonwrapping_link",
    label: "Long reference link does not wrap and widens layout on desktop",
    patterns: [
      /(link|url)[^.]{0,40}(wrap|overflow|widen|stretch|break|nowrap|horizontal\s*scroll)/i,
      /(wrap|overflow|widen|nowrap)[^.]{0,30}(link|url|layout)/i,
      /(layout|form|page)[^.]{0,40}(widen|stretch|overflow|horizontal\s*scroll)/i,
      /long[^.]{0,20}(link|url)/i,
    ],
  },
];

export const TOTAL_PLANTED_DEFECTS = PLANTED_DEFECTS.length;

// Phrases that indicate genuine reproduction discipline.
const REPRO_PATTERNS: RegExp[] = [
  /\bstep\s*\d|\b\d[.)]\s|first[, ].*then|then\b/i,
  /\bexpected\b/i,
  /\bactual\b/i,
  /\b(tap|tapp|click|scroll|open|enter|type|submit|select)\b/i,
  /\b(iphone|android|mobile|phone|desktop|chrome|safari|firefox|390px|375px|viewport)\b/i,
];

// Phrases indicating business-impact prioritization.
const PRIORITY_PATTERNS: RegExp[] = [
  /\b(lead|conversion|convert|quote|revenue|drop[\s-]*off|abandon|inbound|trust|funnel)\b/i,
  /\bbecause\b/i,
  /\bfirst\b/i,
  /\bimpact\b/i,
];

// Phrases indicating restraint ("what NOT to touch").
const RESTRAINT_PATTERNS: RegExp[] = [
  /\bnot\s*(touch|change|ship|do|fix|modify)\b/i,
  /\bwithout\s*(asking|checking|verify|confirm)/i,
  /\bscope\b/i,
  /\b(ask|confirm|verify)\b[^.]{0,40}\b(before|first)\b/i,
];

const URL_RE = /^https?:\/\/[^\s]+$/i;

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.reduce((n, re) => (re.test(text) ? n + 1 : n), 0);
}

// ---------------------------------------------------------------------------
// HARD GATES
// ---------------------------------------------------------------------------

export interface GateResult {
  passed: boolean;
  failures: string[];
  checks: {
    validEmail: boolean;
    validPhone: boolean;
    hasProofArtifact: boolean;
    hasResume: boolean;
    aiHonestyAnswered: boolean;
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function gateResult(payload: CareerApplicationPayload): GateResult {
  const validEmail = EMAIL_RE.test(payload.email);
  const validPhone = payload.whatsapp.replace(/\D/g, "").length >= 7;
  const hasProofArtifact =
    Boolean(payload.proofRecordingUrl) ||
    Boolean(payload.proofFileName) ||
    (Boolean(payload.proofLinks) && URL_RE.test(payload.proofLinks ?? ""));
  const hasResume =
    Boolean(payload.resumeFileName) ||
    (Boolean(payload.resumeUrl) && URL_RE.test(payload.resumeUrl ?? ""));
  // AI disclosure must be answered; if "yes"/"light" the prompt(s) must be pasted.
  const disclosed = ["yes", "light", "no"].includes(payload.aiUseDisclosure);
  const promptRequired = payload.aiUseDisclosure === "yes" || payload.aiUseDisclosure === "light";
  const aiHonestyAnswered =
    disclosed && (!promptRequired || payload.aiPrompts.trim().length >= 10);

  const failures: string[] = [];
  if (!validEmail) failures.push("invalid_email");
  if (!validPhone) failures.push("invalid_phone");
  if (!hasProofArtifact) failures.push("no_proof_artifact");
  if (!hasResume) failures.push("no_resume");
  if (!aiHonestyAnswered) failures.push("ai_disclosure_incomplete");

  return {
    passed: failures.length === 0,
    failures,
    checks: { validEmail, validPhone, hasProofArtifact, hasResume, aiHonestyAnswered },
  };
}

// ---------------------------------------------------------------------------
// DEFECT MATCH — the real signal (max ~45 pts)
// ---------------------------------------------------------------------------

export interface DefectMatchResult {
  caught: string[]; // defect ids found
  caughtCount: number;
  defectPoints: number; // up to 30: 6 per planted defect found
  reproductionPoints: number; // up to 8
  prioritizationPoints: number; // up to 4
  restraintPoints: number; // up to 3
  total: number; // up to 45
}

export function scoreDefectMatch(payload: CareerApplicationPayload): DefectMatchResult {
  // Combined free-text the candidate wrote about the exercise.
  const findingsText = [payload.issueFindings, payload.topIssueSteps, payload.consoleNetworkNotes].join("\n");

  const caught: string[] = [];
  for (const defect of PLANTED_DEFECTS) {
    if (defect.patterns.some((re) => re.test(findingsText))) caught.push(defect.id);
  }
  const perDefect = 30 / TOTAL_PLANTED_DEFECTS; // 6 pts each for the 5 planted defects
  const defectPoints = Math.round(caught.length * perDefect * 10) / 10;

  // Reproduction quality keyed off the dedicated repro-steps field.
  const reproHits = countMatches(payload.topIssueSteps, REPRO_PATTERNS);
  const reproductionPoints = Math.min(8, reproHits * 2);

  // Prioritization by business impact keyed off the "fix first / why" field.
  const prioHits = countMatches(payload.firstFixReason, PRIORITY_PATTERNS);
  const prioritizationPoints = Math.min(4, prioHits);

  // Restraint — naming what NOT to touch, keyed off fix-first + risky-question.
  const restraintHits = countMatches(`${payload.firstFixReason}\n${payload.riskyQuestion}`, RESTRAINT_PATTERNS);
  const restraintPoints = Math.min(3, restraintHits);

  const total = Math.round((defectPoints + reproductionPoints + prioritizationPoints + restraintPoints) * 10) / 10;

  return {
    caught,
    caughtCount: caught.length,
    defectPoints,
    reproductionPoints,
    prioritizationPoints,
    restraintPoints,
    total,
  };
}

// ---------------------------------------------------------------------------
// DETERMINISTIC SIGNALS (max 55 pts) — completeness / artifacts / honesty
// ---------------------------------------------------------------------------

export interface SignalResult {
  completeness: number; // up to 12
  resumeReachable: number; // up to 10
  artifactReachable: number; // up to 10
  availability: number; // up to 5
  surfaces: number; // up to 6
  validProfileUrl: number; // up to 6
  aiHonesty: number; // up to 6
  total: number; // up to 55
}

export interface SignalContext {
  /** Result of best-effort dead-link checks; absent = not checked (no penalty). */
  resumeReachable?: boolean;
  artifactReachable?: boolean;
}

export function scoreSignals(payload: CareerApplicationPayload, ctx: SignalContext = {}): SignalResult {
  // Completeness: every required free-text non-trivially filled.
  const freeTexts = [
    payload.experienceSummary,
    payload.issueFindings,
    payload.topIssueSteps,
    payload.firstFixReason,
    payload.smallImprovement,
    payload.riskyQuestion,
    payload.consoleNetworkNotes,
    payload.aiUseNotes,
  ];
  const filled = freeTexts.filter((t) => t.trim().length >= 40).length;
  const completeness = Math.round((filled / freeTexts.length) * 12 * 10) / 10;

  // Resume present + reachable.
  const hasResumeFile = Boolean(payload.resumeFileName);
  const hasResumeLink = Boolean(payload.resumeUrl) && URL_RE.test(payload.resumeUrl ?? "");
  let resumeReachable = 0;
  if (hasResumeFile) {
    resumeReachable = 10; // uploaded file is inherently reachable
  } else if (hasResumeLink) {
    resumeReachable = ctx.resumeReachable === false ? 3 : 10; // dead link -> partial
  }

  // Proof artifact present + reachable.
  const hasProofFile = Boolean(payload.proofFileName);
  const proofLinkUrl = payload.proofRecordingUrl || (URL_RE.test(payload.proofLinks ?? "") ? payload.proofLinks : "");
  let artifactReachable = 0;
  if (hasProofFile) {
    artifactReachable = 10;
  } else if (proofLinkUrl) {
    artifactReachable = ctx.artifactReachable === false ? 3 : 10;
  }

  // Availability provided.
  const availability = payload.availability.trim().length >= 2 ? 5 : 0;

  // Relevant surfaces checked.
  const surfaces = Math.min(6, payload.surfaces.length * 2);

  // Valid LinkedIn/portfolio URL.
  const hasLinkedin = Boolean(payload.linkedin) && URL_RE.test(payload.linkedin ?? "");
  const hasPortfolio = Boolean(payload.portfolio) && URL_RE.test(payload.portfolio ?? "");
  const validProfileUrl = (hasLinkedin ? 3 : 0) + (hasPortfolio ? 3 : 0);

  // AI honesty: disclosed + (if used) prompt pasted + named what AI got wrong.
  const disclosed = ["yes", "light", "no"].includes(payload.aiUseDisclosure);
  const used = payload.aiUseDisclosure === "yes" || payload.aiUseDisclosure === "light";
  const promptPasted = payload.aiPrompts.trim().length >= 10;
  const namedMistake = /(wrong|caught|corrected|fixed|incorrect|mistake|hallucin|verif)/i.test(payload.aiPrompts);
  let aiHonesty = 0;
  if (disclosed) aiHonesty += 2;
  if (used && promptPasted) aiHonesty += 2;
  if (used && namedMistake) aiHonesty += 2;
  if (!used && disclosed) aiHonesty += 2; // honest "no" with notes still earns partial
  aiHonesty = Math.min(6, aiHonesty);

  const total =
    Math.round(
      (completeness + resumeReachable + artifactReachable + availability + surfaces + validProfileUrl + aiHonesty) * 10
    ) / 10;

  return {
    completeness,
    resumeReachable,
    artifactReachable,
    availability,
    surfaces,
    validProfileUrl,
    aiHonesty,
    total,
  };
}

// ---------------------------------------------------------------------------
// TIERING + FINAL SCORE
// ---------------------------------------------------------------------------

export type RecruitingTier = "strong" | "maybe" | "weak";

export interface RecruitingScore {
  total: number; // 0-100
  label: RecruitingTier; // tier
  explanation: string;
  breakdown: {
    gate: GateResult;
    defectMatch: DefectMatchResult;
    signals: SignalResult;
    defectsCaught: string[];
    defectsCaughtCount: number;
    totalPlantedDefects: number;
    qualified: boolean;
    /** Reserved for a future flag-gated LLM refinement. Null today. */
    llm: null;
  };
}

/**
 * Reserved seam for a future LLM grader (flag-gated, due-diligence required).
 * Deliberately a no-op today so no external AI call is made.
 */
export async function gradeWithLlm(): Promise<null> {
  return null;
}

export function computeRecruitingScore(
  payload: CareerApplicationPayload,
  ctx: SignalContext = {}
): RecruitingScore {
  const gate = gateResult(payload);
  const defectMatch = scoreDefectMatch(payload);
  const signals = scoreSignals(payload, ctx);

  let total = Math.round((defectMatch.total + signals.total) * 10) / 10;
  total = Math.max(0, Math.min(100, total));

  // A failed hard gate caps the score and forces the lowest actionable band.
  const qualified = gate.passed && defectMatch.caughtCount >= 2;
  if (!gate.passed) {
    total = Math.min(total, 49);
  }

  let label: RecruitingTier;
  if (!gate.passed) {
    label = "weak";
  } else if (total >= 70 && defectMatch.caughtCount >= 3) {
    label = "strong";
  } else if (total >= 50 && defectMatch.caughtCount >= 1) {
    label = "maybe";
  } else {
    label = "weak";
  }

  const explanation = buildExplanation(label, gate, defectMatch, qualified);

  return {
    total,
    label,
    explanation,
    breakdown: {
      gate,
      defectMatch,
      signals,
      defectsCaught: defectMatch.caught,
      defectsCaughtCount: defectMatch.caughtCount,
      totalPlantedDefects: TOTAL_PLANTED_DEFECTS,
      qualified,
      llm: null,
    },
  };
}

function buildExplanation(
  label: RecruitingTier,
  gate: GateResult,
  defectMatch: DefectMatchResult,
  qualified: boolean
): string {
  if (!gate.passed) {
    const human: Record<string, string> = {
      invalid_email: "email format invalid",
      invalid_phone: "phone/WhatsApp invalid",
      no_proof_artifact: "no proof-of-inspection artifact",
      no_resume: "no resume file or link",
      ai_disclosure_incomplete: "AI disclosure not fully answered",
    };
    const reasons = gate.failures.map((f) => human[f] ?? f).join(", ");
    return `Failed a hard gate (${reasons}). Capped to weak/unreviewed regardless of answer detail.`;
  }
  const caughtPart = `Caught ${defectMatch.caughtCount}/${TOTAL_PLANTED_DEFECTS} planted defects`;
  if (label === "strong") {
    return `${caughtPart}, with concrete reproduction steps and impact-based prioritization. Qualified=${qualified}.`;
  }
  if (label === "maybe") {
    return `${caughtPart}. Reviewable, but sharper defect identification or prioritization would lift this. Qualified=${qualified}.`;
  }
  return `${caughtPart}. Thin against the planted defects — likely keyword padding without real inspection. Qualified=${qualified}.`;
}
