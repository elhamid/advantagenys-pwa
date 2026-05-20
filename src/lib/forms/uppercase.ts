/**
 * Fields excluded from uppercase transformation.
 * Matched by checking if the lowercase field name contains any of these substrings.
 */
const EXCLUDED_SUBSTRINGS = [
  "email",
  "phone",
  "ssn",
  "itin",
  "url",
  "website",
  "routing",   // bank routing numbers
  "account",   // bank account numbers
  "ein",       // employer identification numbers
];

/**
 * Recursively uppercases all string values in a form data object,
 * except for fields whose names (lowercased) contain excluded substrings
 * (email, phone, ssn, itin, url, routing, account, ein).
 *
 * Non-string values (numbers, booleans, arrays, nested objects) are
 * traversed or passed through unchanged.
 */
export function uppercaseFormData<T extends Record<string, unknown>>(data: T): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      const keyLower = key.toLowerCase();
      const isExcluded = EXCLUDED_SUBSTRINGS.some((sub) => keyLower.includes(sub));
      result[key] = isExcluded ? value : value.toUpperCase();
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === "string"
          ? item.toUpperCase()
          : item && typeof item === "object"
            ? uppercaseFormData(item as Record<string, unknown>)
            : item
      );
    } else if (value && typeof value === "object") {
      result[key] = uppercaseFormData(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
