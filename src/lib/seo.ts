export const BASE_URL = "https://advantagenys.com";

/**
 * Build a canonical URL from a page path. Accepts "/", "/about", "/services/tax-services",
 * with or without a trailing slash. Always returns a fully-qualified URL on BASE_URL
 * with no trailing slash (except for the root).
 */
export function makeCanonical(path: string): string {
  if (!path || path === "/") return BASE_URL;
  const clean = path.startsWith("/") ? path : `/${path}`;
  const trimmed = clean.endsWith("/") && clean !== "/" ? clean.slice(0, -1) : clean;
  return `${BASE_URL}${trimmed}`;
}
