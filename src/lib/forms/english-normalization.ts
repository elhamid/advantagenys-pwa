const CONTROL_AND_DIRECTIONAL_PATTERN = /[\u0000-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g;
const COMBINING_MARK_PATTERN = /[\u0300-\u036f]/g;

const PUNCTUATION_EQUIVALENTS: Record<string, string> = {
  "\u2018": "'",
  "\u2019": "'",
  "\u201A": "'",
  "\u201B": "'",
  "\u201C": '"',
  "\u201D": '"',
  "\u201E": '"',
  "\u201F": '"',
  "\u2013": "-",
  "\u2014": "-",
  "\u2212": "-",
  "\u00A0": " ",
};

export function normalizeEnglishTextValue(value: string): string {
  let normalized = value.normalize("NFKC").replace(CONTROL_AND_DIRECTIONAL_PATTERN, "");
  normalized = Array.from(normalized, (char) => PUNCTUATION_EQUIVALENTS[char] ?? char).join("");
  normalized = normalized.normalize("NFKD").replace(COMBINING_MARK_PATTERN, "");
  return normalized.replace(/\s+/g, " ").trim();
}

export function normalizeEnglishValue(value: string | string[]): string | string[] {
  if (Array.isArray(value)) {
    return value.map(normalizeEnglishTextValue).filter(Boolean);
  }
  return normalizeEnglishTextValue(value);
}

export function hasNonLatinLetters(value: string): boolean {
  for (const char of Array.from(value)) {
    if (/\p{Letter}/u.test(char) && !/\p{Script=Latin}/u.test(char)) return true;
  }
  return false;
}

export function englishInputError(value: string | string[], label = "This field"): string | null {
  const values = Array.isArray(value) ? value : [value];
  if (values.some((entry) => hasNonLatinLetters(normalizeEnglishTextValue(entry)))) {
    return `${label} must use English letters. For legal names, use the spelling from the passport or government ID.`;
  }
  return null;
}
