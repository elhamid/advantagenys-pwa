import { describe, it, expect } from 'vitest'
import { GET } from '../route'

describe('GET /llms-full.txt', () => {
  async function getResponse() {
    return GET()
  }

  // ---------------------------------------------------------------------------
  // Content-Type
  // ---------------------------------------------------------------------------
  it('returns Content-Type text/plain', async () => {
    const res = await getResponse()
    const contentType = res.headers.get('Content-Type') ?? ''
    expect(contentType).toContain('text/plain')
  })

  // ---------------------------------------------------------------------------
  // Header / branding
  // ---------------------------------------------------------------------------
  it('includes "Advantage Services" in the body', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('Advantage Services')
  })

  // ---------------------------------------------------------------------------
  // Detailed service descriptions
  // ---------------------------------------------------------------------------
  it('includes tax services description', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('Tax Services')
    expect(text).toContain('IRS-certified')
  })

  it('includes ITIN service description', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('ITIN Tax ID')
    expect(text).toContain('Certified Acceptance Agent')
  })

  it('includes business formation description', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('Business Formation')
    expect(text).toContain('LLC')
  })

  it('includes licensing description', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('Business Licensing')
  })

  it('includes insurance description', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('Insurance')
    expect(text).toContain("workers' compensation")
  })

  it('includes audit defense description', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('Audit Defense')
  })

  it('includes financial services description', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('Financial Services')
    expect(text).toContain('bookkeeping')
  })

  it('includes legal services description', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('Immigration & Legal Services')
  })

  // ---------------------------------------------------------------------------
  // Team members
  // ---------------------------------------------------------------------------
  it('includes team member Sanjay (Jay) Agrawal', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('Sanjay')
    expect(text).toContain('Agrawal')
  })

  it('includes team member Kedar Gupta', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('Kedar Gupta')
  })

  it('includes team member Ziaur (Zia) Khan', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('Ziaur')
  })

  it('includes team member Hamid Elsevar', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('Hamid Elsevar')
  })

  // ---------------------------------------------------------------------------
  // Statistics
  // ---------------------------------------------------------------------------
  it('includes business formation statistic', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('1,700+')
  })

  it('includes tax clients statistic', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('5,700+')
  })

  it('includes business licenses statistic', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('2,500+')
  })

  it('includes ITINs processed statistic', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('2,250+')
  })

  // ---------------------------------------------------------------------------
  // Contact info
  // ---------------------------------------------------------------------------
  it('includes phone number (929) 933-1396', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('(929) 933-1396')
  })

  it('includes email info@advantagenys.com', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('info@advantagenys.com')
  })

  it('includes office address 229-14 Linden Blvd', async () => {
    const res = await getResponse()
    const text = await res.text()
    expect(text).toContain('229-14 Linden Blvd')
  })
})
