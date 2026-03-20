import { describe, it, expect } from 'vitest'
import { GET } from '../route'

describe('GET /llms.txt', () => {
  async function getResponse() {
    return GET()
  }

  // ---------------------------------------------------------------------------
  // Content-Type header
  // ---------------------------------------------------------------------------
  it('returns Content-Type text/plain', async () => {
    const res = await getResponse()
    const contentType = res.headers.get('Content-Type') ?? ''
    expect(contentType).toContain('text/plain')
  })

  // ---------------------------------------------------------------------------
  // Core content checks
  // ---------------------------------------------------------------------------
  it('includes "Advantage Services" in the response body', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('Advantage Services')
  })

  it('includes tax services URL', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('https://advantagenys.com/services/tax-services')
  })

  it('includes ITIN tax ID URL', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('https://advantagenys.com/services/tax-services/itin-tax-id')
  })

  it('includes business formation URL', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('https://advantagenys.com/services/business-formation')
  })

  it('includes business licensing URL', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('https://advantagenys.com/services/licensing')
  })

  it('includes insurance URL', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('https://advantagenys.com/services/insurance')
  })

  it('includes audit defense URL', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('https://advantagenys.com/services/audit-defense')
  })

  it('includes financial services URL', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('https://advantagenys.com/services/financial-services')
  })

  it('includes legal services URL', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('https://advantagenys.com/services/legal')
  })

  // ---------------------------------------------------------------------------
  // Industry URLs
  // ---------------------------------------------------------------------------
  it('includes restaurants industry URL', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('https://advantagenys.com/industries/restaurants')
  })

  it('includes contractors industry URL', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('https://advantagenys.com/industries/contractors')
  })

  it('includes immigrant-entrepreneurs industry URL', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('https://advantagenys.com/industries/immigrant-entrepreneurs')
  })

  // ---------------------------------------------------------------------------
  // Contact information
  // ---------------------------------------------------------------------------
  it('includes phone number (929) 933-1396', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('(929) 933-1396')
  })

  it('includes email address info@advantagenys.com', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('info@advantagenys.com')
  })

  it('includes the office address', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('229-14 Linden Blvd')
  })

  it('includes the website URL https://advantagenys.com', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('https://advantagenys.com')
  })
})
