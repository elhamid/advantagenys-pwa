import { describe, it, expect } from 'vitest'
import sitemap from '../sitemap'

const BASE_URL = 'https://advantagenys.com'

describe('sitemap()', () => {
  // ---------------------------------------------------------------------------
  // Shape
  // ---------------------------------------------------------------------------
  it('returns an array', () => {
    const result = sitemap()
    expect(Array.isArray(result)).toBe(true)
  })

  it('returns at least one URL entry', () => {
    const result = sitemap()
    expect(result.length).toBeGreaterThan(0)
  })

  it('every entry has a url string', () => {
    for (const entry of sitemap()) {
      expect(typeof entry.url).toBe('string')
      expect(entry.url.length).toBeGreaterThan(0)
    }
  })

  it('every entry has a lastModified date', () => {
    for (const entry of sitemap()) {
      expect(entry.lastModified).toBeInstanceOf(Date)
    }
  })

  // ---------------------------------------------------------------------------
  // Homepage
  // ---------------------------------------------------------------------------
  it('includes the homepage URL', () => {
    const urls = sitemap().map((e) => e.url)
    expect(urls).toContain(`${BASE_URL}/`)
  })

  it('homepage has priority 1.0', () => {
    const home = sitemap().find((e) => e.url === `${BASE_URL}/`)
    expect(home?.priority).toBe(1.0)
  })

  it('homepage has changeFrequency "weekly"', () => {
    const home = sitemap().find((e) => e.url === `${BASE_URL}/`)
    expect(home?.changeFrequency).toBe('weekly')
  })

  // ---------------------------------------------------------------------------
  // Service pages — priority 0.9
  // ---------------------------------------------------------------------------
  const serviceUrls = [
    `${BASE_URL}/services/tax-services`,
    `${BASE_URL}/services/tax-services/itin-tax-id`,
    `${BASE_URL}/services/business-formation`,
    `${BASE_URL}/services/licensing`,
    `${BASE_URL}/services/insurance`,
    `${BASE_URL}/services/audit-defense`,
    `${BASE_URL}/services/financial-services`,
    `${BASE_URL}/services/legal`,
  ]

  for (const url of serviceUrls) {
    it(`includes ${url}`, () => {
      const urls = sitemap().map((e) => e.url)
      expect(urls).toContain(url)
    })

    it(`${url} has priority 0.9`, () => {
      const entry = sitemap().find((e) => e.url === url)
      expect(entry?.priority).toBe(0.9)
    })
  }

  // ---------------------------------------------------------------------------
  // Industry pages
  // ---------------------------------------------------------------------------
  const industryUrls = [
    `${BASE_URL}/industries/restaurants`,
    `${BASE_URL}/industries/contractors`,
    `${BASE_URL}/industries/immigrant-entrepreneurs`,
  ]

  for (const url of industryUrls) {
    it(`includes ${url}`, () => {
      const urls = sitemap().map((e) => e.url)
      expect(urls).toContain(url)
    })
  }

  // ---------------------------------------------------------------------------
  // Tools pages
  // ---------------------------------------------------------------------------
  const toolUrls = [
    `${BASE_URL}/tools/tax-savings-estimator`,
    `${BASE_URL}/tools/business-readiness-checker`,
    `${BASE_URL}/tools/itin-eligibility-checker`,
  ]

  for (const url of toolUrls) {
    it(`includes ${url}`, () => {
      const urls = sitemap().map((e) => e.url)
      expect(urls).toContain(url)
    })
  }

  // ---------------------------------------------------------------------------
  // Additional expected URLs
  // ---------------------------------------------------------------------------
  const additionalUrls = [
    `${BASE_URL}/about`,
    `${BASE_URL}/contact`,
    `${BASE_URL}/resources`,
    `${BASE_URL}/privacy`,
    `${BASE_URL}/terms`,
  ]

  for (const url of additionalUrls) {
    it(`includes ${url}`, () => {
      const urls = sitemap().map((e) => e.url)
      expect(urls).toContain(url)
    })
  }

  // ---------------------------------------------------------------------------
  // Priority ordering
  // ---------------------------------------------------------------------------
  it('contact page has priority 0.8', () => {
    const entry = sitemap().find((e) => e.url === `${BASE_URL}/contact`)
    expect(entry?.priority).toBe(0.8)
  })

  it('about page has priority 0.7', () => {
    const entry = sitemap().find((e) => e.url === `${BASE_URL}/about`)
    expect(entry?.priority).toBe(0.7)
  })

  it('privacy page has priority 0.3', () => {
    const entry = sitemap().find((e) => e.url === `${BASE_URL}/privacy`)
    expect(entry?.priority).toBe(0.3)
  })

  it('terms page has priority 0.3', () => {
    const entry = sitemap().find((e) => e.url === `${BASE_URL}/terms`)
    expect(entry?.priority).toBe(0.3)
  })

  // ---------------------------------------------------------------------------
  // No duplicates
  // ---------------------------------------------------------------------------
  it('contains no duplicate URLs', () => {
    const urls = sitemap().map((e) => e.url)
    const unique = new Set(urls)
    expect(unique.size).toBe(urls.length)
  })
})
