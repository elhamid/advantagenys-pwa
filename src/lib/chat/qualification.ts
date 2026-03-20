// Qualification Scoring — Lead scoring for Ava web chat
// Ported from advantage-taskboard's qualification-scoring.ts.
//
// Score tiers:
//   0-20  -> cold      (just browsing, no clear need)
//  21-50  -> warm      (has need, no urgency or budget signal)
//  51-75  -> hot       (need + urgency + budget signal)
//  76-100 -> qualified (ready for human handoff)

// ============================================================================
// Types
// ============================================================================

export interface QualificationResult {
  score: number;
  level: "cold" | "warm" | "hot" | "qualified";
  shouldHandoff: boolean;
  detectedService?: string;
}

interface SimpleMessage {
  role: "user" | "assistant";
  content: string;
}

// ============================================================================
// Signal patterns
// ============================================================================

const URGENCY_PATTERNS = [
  /\b(asap|urgent|urgente|immediately|right away|today|esta\s+semana|this\s+week|deadline|due\s+date|vencimiento|ahora|now|pronto|soon|quickly|r[aá]pido|soon\s+as\s+possible)\b/i,
  /\b(irs|audit|notice|carta|letter|penalty|multa|overdue|atrasado)\b/i,
  /\b(april|march|tax\s+season|temporada|extension)\b/i,
];

const BUDGET_PATTERNS = [
  /\b(how\s+much|cu[aá]nto|precio|price|cost|costo|fee|charge|afford|budget|presupuesto|rate|tarifa)\b/i,
  /\b(\$\d+|dollars?|d[oó]lares?|dinero|money|pago|payment|quote|cotizaci[oó]n)\b/i,
  /\b(cheap|affordable|asequible|barato|econ[oó]mico|discount|descuento)\b/i,
];

const AUTHORITY_PATTERNS = [
  /\b(i\s+own|soy\s+due[nñ]o|my\s+business|mi\s+negocio|our\s+company|nuestra\s+empresa|i\s+am\s+the\s+(owner|ceo|founder|presidente)|i\s+decide|i\s+need\s+to\s+sign)\b/i,
  /\b(owner|due[nñ]o|propietario|founder|principal|partner|socio)\b/i,
];

const TIMELINE_PATTERNS = [
  /\b(\d+\s*(days?|weeks?|months?|d[ií]as?|semanas?|meses?))\b/i,
  /\b(next\s+(month|week|year)|pr[oó]ximo|this\s+(month|year|quarter))\b/i,
  /\b(january|february|march|april|may|june|july|august|september|october|november|december|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/i,
];

const SERVICE_NEED_PATTERNS = [
  /\b(need|necesito|want|quiero|looking\s+for|busco|interested|interesado|help\s+with|ayuda\s+con|asking\s+about|pregunto\s+sobre)\b/i,
  /\b(tax|impuesto|bookkeeping|contabilidad|payroll|n[oó]mina|insurance|seguro|llc|incorporation|incorporaci[oó]n|itin|formation|formaci[oó]n|audit|auditor[ií]a)\b/i,
];

const NAME_PATTERNS = [
  /\b(my\s+name\s+is|me\s+llamo|i\s+am|soy|i'm)\s+[A-Z][a-z]+/i,
  /^[A-Z][a-z]+[,\s]/,
];

// Service detection for the detectedService field
const SERVICE_KEYWORDS: Record<string, RegExp> = {
  tax: /\b(tax|impuesto|taxes|impuestos|itin|tax\s+return|declaraci[oó]n)\b/i,
  bookkeeping: /\b(bookkeeping|contabilidad|books|accounting)\b/i,
  payroll: /\b(payroll|n[oó]mina|nomina)\b/i,
  insurance: /\b(insurance|seguro|seguros|liability|workers?\s+comp)\b/i,
  formation: /\b(llc|corporation|corp|incorporation|dba|formation|formaci[oó]n|register|registrar)\b/i,
  licensing: /\b(license|licencia|permit|permiso)\b/i,
  legal: /\b(legal|lawyer|abogado|immigration|inmigraci[oó]n|greencard|green\s+card|visa|citizenship|ciudadan[ií]a|daca|asylum|asilo)\b/i,
  audit: /\b(audit|auditor[ií]a|irs\s+notice)\b/i,
};

// ============================================================================
// Helpers
// ============================================================================

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

function getUserText(messages: SimpleMessage[]): string {
  return messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");
}

function scoreEngagement(messages: SimpleMessage[]): number {
  const userMessages = messages.filter((m) => m.role === "user");
  const count = userMessages.length;
  if (count < 2) return 0;

  const avgLength =
    count > 0
      ? userMessages.reduce((sum, m) => sum + m.content.length, 0) / count
      : 0;

  const countScore = Math.min((count - 1) * 3, 15);
  const lengthBonus = avgLength > 100 ? 3 : avgLength > 50 ? 1 : 0;
  return Math.min(countScore + lengthBonus, 15);
}

function scoreServiceMatch(userText: string): number {
  const serviceWords = [
    "tax", "impuesto", "taxes", "impuestos",
    "bookkeeping", "contabilidad", "books",
    "payroll", "nomina",
    "insurance", "seguro", "seguros",
    "llc", "corporation", "corp",
    "itin", "individual taxpayer",
    "formation", "register",
    "audit", "irs notice",
    "legal", "lawyer", "abogado", "immigration", "greencard", "green card",
    "visa", "work permit", "citizenship", "daca", "asylum",
  ];

  const hasServiceKeyword = serviceWords.some((kw) =>
    userText.toLowerCase().includes(kw)
  );
  const hasNeedSignal = matchesAny(userText, SERVICE_NEED_PATTERNS);

  if (hasServiceKeyword && hasNeedSignal) return 15;
  if (hasServiceKeyword || hasNeedSignal) return 8;
  return 0;
}

function detectService(userText: string): string | undefined {
  const lower = userText.toLowerCase();
  for (const [service, pattern] of Object.entries(SERVICE_KEYWORDS)) {
    if (pattern.test(lower)) return service;
  }
  return undefined;
}

// ============================================================================
// Public API
// ============================================================================

const MIN_MESSAGES_FOR_QUALIFICATION = 4;

/**
 * Calculate a lead qualification score from conversation history.
 *
 * Factors (max points):
 *   has_need       +20
 *   has_urgency    +15
 *   has_budget     +15
 *   has_timeline   +10
 *   has_authority  +10
 *   engagement     0-15
 *   service_match  +15
 *   name_bonus     +5 (if name provided)
 *
 * Total possible: 100
 * Pacing gate: capped at 74 until MIN_MESSAGES_FOR_QUALIFICATION user messages.
 * Handoff triggers at score >= 76.
 */
export function calculateQualification(
  messages: SimpleMessage[]
): QualificationResult {
  const userText = getUserText(messages);
  const userMessageCount = messages.filter((m) => m.role === "user").length;

  const factors: Record<string, number> = {
    has_need: matchesAny(userText, SERVICE_NEED_PATTERNS) ? 20 : 0,
    has_urgency: matchesAny(userText, URGENCY_PATTERNS) ? 15 : 0,
    has_budget: matchesAny(userText, BUDGET_PATTERNS) ? 15 : 0,
    has_timeline: matchesAny(userText, TIMELINE_PATTERNS) ? 10 : 0,
    has_authority: matchesAny(userText, AUTHORITY_PATTERNS) ? 10 : 0,
    engagement_level: scoreEngagement(messages),
    service_match: scoreServiceMatch(userText),
  };

  const nameBonus = matchesAny(userText, NAME_PATTERNS) ? 5 : 0;
  const raw = Object.values(factors).reduce((sum, v) => sum + v, 0) + nameBonus;
  let score = Math.min(100, Math.max(0, raw));

  // Pacing gate: cap at 74 until enough user messages
  if (userMessageCount < MIN_MESSAGES_FOR_QUALIFICATION) {
    score = Math.min(score, 74);
  }

  let level: QualificationResult["level"];
  if (score >= 76) level = "qualified";
  else if (score >= 51) level = "hot";
  else if (score >= 21) level = "warm";
  else level = "cold";

  return {
    score,
    level,
    shouldHandoff: score >= 76,
    detectedService: detectService(userText),
  };
}
