// PWA Bot Knowledge — keyword-match retrieval against taskboard's bot_knowledge_base
// Read-only: uses the taskboard Supabase anon key (no writes).
// Cache: full knowledge base held in-memory for 5 minutes to avoid repeated DB calls.

import { taskboardSupabase } from "@/lib/taskboard-supabase";

// ============================================================================
// Types
// ============================================================================

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  keywords: string[];
  service_slug?: string;
  is_active: boolean;
}

// ============================================================================
// In-memory cache
// ============================================================================

interface CacheEntry {
  data: KnowledgeEntry[];
  loadedAt: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let _cache: CacheEntry | null = null;

async function loadAllActive(): Promise<KnowledgeEntry[]> {
  if (_cache && Date.now() - _cache.loadedAt < CACHE_TTL) {
    return _cache.data;
  }

  if (!taskboardSupabase) {
    console.warn("[knowledge] taskboardSupabase client is null — missing env vars");
    return [];
  }

  const { data, error } = await taskboardSupabase
    .from("bot_knowledge_base")
    .select("id, category, title, content, service_slug, keywords, is_active, priority")
    .eq("is_active", true)
    .order("priority", { ascending: false });

  if (error) {
    console.error("[knowledge] Failed to fetch bot_knowledge_base:", error);
    return [];
  }

  const entries = (data ?? []) as KnowledgeEntry[];
  _cache = { data: entries, loadedAt: Date.now() };
  return entries;
}

// ============================================================================
// Keyword matching (ported from taskboard's knowledge.ts)
// ============================================================================

const DEFAULT_NORMALIZATIONS: Record<string, string> = {
  greencard: "green card",
  "green-card": "green card",
  greencards: "green cards",
  workpermit: "work permit",
  workpermits: "work permits",
  salestax: "sales tax",
  payrolltax: "payroll tax",
  llcformation: "llc formation",
};

function normalizeText(input: string): string {
  let normalized = input.toLowerCase();
  for (const [from, to] of Object.entries(DEFAULT_NORMALIZATIONS)) {
    normalized = normalized.replace(
      new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g"),
      to
    );
  }
  return normalized;
}

function compactToken(value: string): string {
  return value.replace(/[^a-z0-9]+/g, "");
}

function extractWords(text: string): string[] {
  return normalizeText(text)
    .split(/[\s.,!?;:()\[\]{}"'\/\\-]+/)
    .filter((w) => w.length >= 3);
}

function countKeywordHits(entryKeywords: string[], messageWords: string[], fullInput: string): number {
  const normalizedInput = normalizeText(fullInput);
  let hits = 0;

  for (const keyword of entryKeywords) {
    const normalizedKeyword = normalizeText(keyword).trim();
    if (!normalizedKeyword || normalizedKeyword.length < 3) continue;

    if (normalizedInput.includes(normalizedKeyword)) {
      hits++;
      continue;
    }

    const compactKeyword = compactToken(normalizedKeyword);
    if (compactKeyword.length < 3) continue;

    const matched = messageWords.some((word) => {
      if (word.includes(normalizedKeyword) || normalizedKeyword.includes(word)) return true;
      const compactWord = compactToken(word);
      return Boolean(compactWord && compactKeyword) &&
        (compactWord.includes(compactKeyword) || compactKeyword.includes(compactWord));
    });

    if (matched) hits++;
  }

  return hits;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Find relevant knowledge entries for a user query using keyword matching.
 * Returns up to 5 results sorted by number of keyword hits (desc).
 */
export async function findRelevantKnowledge(
  query: string,
  _language?: string
): Promise<KnowledgeEntry[]> {
  const entries = await loadAllActive();
  if (entries.length === 0) return [];

  const messageWords = extractWords(query);

  const scored: Array<{ entry: KnowledgeEntry; hits: number }> = [];

  for (const entry of entries) {
    const hits = countKeywordHits(entry.keywords ?? [], messageWords, query);
    if (hits > 0) {
      scored.push({ entry, hits });
    }
  }

  scored.sort((a, b) => b.hits - a.hits);
  return scored.slice(0, 5).map((s) => s.entry);
}

/**
 * Fetch all active entries with category = 'form_link'.
 */
export async function getFormLinks(): Promise<KnowledgeEntry[]> {
  if (!taskboardSupabase) {
    console.warn("[knowledge] taskboardSupabase client is null");
    return [];
  }

  const { data, error } = await taskboardSupabase
    .from("bot_knowledge_base")
    .select("id, category, title, content, service_slug, keywords, is_active")
    .eq("category", "form_link")
    .eq("is_active", true)
    .order("priority", { ascending: false });

  if (error) {
    console.error("[getFormLinks] Failed:", error);
    return [];
  }

  return (data ?? []) as KnowledgeEntry[];
}

/**
 * Fetch active FAQ entries for a specific service slug.
 */
export async function getFAQsByService(serviceSlug: string): Promise<KnowledgeEntry[]> {
  if (!taskboardSupabase) {
    console.warn("[knowledge] taskboardSupabase client is null");
    return [];
  }

  const { data, error } = await taskboardSupabase
    .from("bot_knowledge_base")
    .select("id, category, title, content, service_slug, keywords, is_active")
    .eq("category", "faq")
    .eq("service_slug", serviceSlug)
    .eq("is_active", true)
    .order("priority", { ascending: false });

  if (error) {
    console.error("[getFAQsByService] Failed:", error);
    return [];
  }

  return (data ?? []) as KnowledgeEntry[];
}
