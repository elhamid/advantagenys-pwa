import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, _testing } from '../route'

// Helper to build a NextRequest with a JSON body
function makeRequest(payload: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  })
}

// Default valid contact payload (no booking fields)
const validContact = {
  fullName: 'Test User',
  phone: '1234567890',
  email: 'test@example.com',
  businessType: 'LLC',
  services: ['Tax'],
  message: 'Test message',
  turnstileToken: 'valid-token',
}

// Default valid booking payload
const validBooking = {
  fullName: 'Book User',
  phone: '9876543210',
  email: 'book@example.com',
  type: 'booking',
  serviceType: 'Tax Consultation',
  preferredDate: '2026-04-01',
  preferredTime: '10:00 AM',
  turnstileToken: 'valid-token',
}

// Produces a fetch mock that routes by URL:
//   Cloudflare siteverify  → turnstileSuccess flag controls success
//   anything else          → webhookStatus controls response
function makeFetchMock({
  turnstileSuccess = true,
  webhookStatus = 200,
  webhookThrows = false,
}: {
  turnstileSuccess?: boolean
  webhookStatus?: number
  webhookThrows?: boolean
} = {}) {
  return vi.fn(async (url: string | URL | Request) => {
    const urlStr = typeof url === 'string' ? url : url instanceof URL ? url.href : url.url

    if (urlStr.includes('cloudflare.com/turnstile')) {
      return {
        json: async () => ({ success: turnstileSuccess }),
        ok: true,
      } as unknown as Response
    }

    // Webhook call
    if (webhookThrows) {
      throw new Error('network error')
    }
    return {
      ok: webhookStatus >= 200 && webhookStatus < 300,
      status: webhookStatus,
      text: async () => 'error body',
      json: async () => ({}),
    } as unknown as Response
  })
}

describe('POST /api/contact', () => {
  // vitest.setup.ts pre-sets TURNSTILE_SECRET_KEY and TASKBOARD_WEBHOOK_URL
  // We capture originals here so per-test overrides can be safely restored.
  const originalTurnstileKey = process.env.TURNSTILE_SECRET_KEY
  const originalWebhookUrl = process.env.TASKBOARD_WEBHOOK_URL
  const originalWebhookSecret = process.env.PWA_WEBHOOK_SECRET

  beforeEach(() => {
    // Restore baseline env before every test
    process.env.TURNSTILE_SECRET_KEY = originalTurnstileKey
    process.env.TASKBOARD_WEBHOOK_URL = originalWebhookUrl
    // Ensure webhook secret is present for webhook-related tests by default
    process.env.PWA_WEBHOOK_SECRET = 'test-pwa-secret'
    // Default to "test" NODE_ENV — dev-ergonomic path for Turnstile skip tests
    vi.stubEnv('NODE_ENV', 'test')
    global.fetch = makeFetchMock()
    // Reset rate limiter between tests (module-level singleton)
    _testing.contactLimiter.reset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    process.env.PWA_WEBHOOK_SECRET = originalWebhookSecret
  })

  // -----------------------------------------------------------------------
  // 1. Valid contact payload → 200
  // -----------------------------------------------------------------------
  it('returns 200 and success:true for a valid contact payload', async () => {
    const res = await POST(makeRequest(validContact))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ success: true })
  })

  // -----------------------------------------------------------------------
  // 2. Valid booking payload → 200
  // -----------------------------------------------------------------------
  it('returns 200 and success:true for a valid booking payload', async () => {
    const res = await POST(makeRequest(validBooking))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ success: true })
  })

  // -----------------------------------------------------------------------
  // 3. Missing fullName → 400
  // -----------------------------------------------------------------------
  it('returns 400 when fullName is missing', async () => {
    const { fullName: _omit, ...payload } = validContact
    void _omit
    const res = await POST(makeRequest(payload))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toMatch(/full name/i)
  })

  it('returns 400 when fullName is an empty string', async () => {
    const res = await POST(makeRequest({ ...validContact, fullName: '   ' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toMatch(/full name/i)
  })

  // -----------------------------------------------------------------------
  // 4. Missing phone → 400
  // -----------------------------------------------------------------------
  it('returns 400 when phone is missing', async () => {
    const { phone: _omit, ...payload } = validContact
    void _omit
    const res = await POST(makeRequest(payload))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toMatch(/phone/i)
  })

  // -----------------------------------------------------------------------
  // 5. Phone < 7 chars → 400
  // -----------------------------------------------------------------------
  it('returns 400 when phone has fewer than 7 characters', async () => {
    const res = await POST(makeRequest({ ...validContact, phone: '123' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toMatch(/phone/i)
  })

  it('accepts a phone with exactly 7 characters', async () => {
    const res = await POST(makeRequest({ ...validContact, phone: '1234567' }))
    expect(res.status).toBe(200)
  })

  // -----------------------------------------------------------------------
  // 6. Invalid email format → 400
  // -----------------------------------------------------------------------
  it('returns 400 for a malformed email address', async () => {
    const res = await POST(makeRequest({ ...validContact, email: 'not-an-email' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toMatch(/email/i)
  })

  it('accepts a request with no email field (email is optional)', async () => {
    const { email: _omit, ...payload } = validContact
    void _omit
    const res = await POST(makeRequest(payload))
    expect(res.status).toBe(200)
  })

  it('accepts a request with an empty email string (treated as absent)', async () => {
    const res = await POST(makeRequest({ ...validContact, email: '' }))
    expect(res.status).toBe(200)
  })

  // -----------------------------------------------------------------------
  // 7. Turnstile — valid token → proceeds; invalid token → 403
  // -----------------------------------------------------------------------
  it('proceeds when Turnstile returns success:true', async () => {
    global.fetch = makeFetchMock({ turnstileSuccess: true })
    const res = await POST(makeRequest(validContact))
    expect(res.status).toBe(200)
  })

  it('returns 403 when Turnstile returns success:false', async () => {
    global.fetch = makeFetchMock({ turnstileSuccess: false })
    const res = await POST(makeRequest(validContact))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toMatch(/human verification/i)
  })

  it('returns 403 when turnstileToken is absent but TURNSTILE_SECRET_KEY is set', async () => {
    const { turnstileToken: _omit, ...payload } = validContact
    void _omit
    const res = await POST(makeRequest(payload))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toMatch(/human verification/i)
  })

  it('skips Turnstile in development when TURNSTILE_SECRET_KEY is absent', async () => {
    delete process.env.TURNSTILE_SECRET_KEY
    vi.stubEnv('NODE_ENV', 'development')
    const fetchSpy = makeFetchMock()
    global.fetch = fetchSpy
    // Omit token — should still succeed because the key is absent in dev
    const { turnstileToken: _omit, ...payload } = validContact
    void _omit
    const res = await POST(makeRequest(payload))
    expect(res.status).toBe(200)
    // Cloudflare siteverify must NOT have been called
    const cloudflareCalled = (fetchSpy.mock.calls as [string][]).some(([url]) =>
      url.includes('cloudflare.com/turnstile'),
    )
    expect(cloudflareCalled).toBe(false)
  })

  it('fails closed with 503 in production when TURNSTILE_SECRET_KEY is missing', async () => {
    delete process.env.TURNSTILE_SECRET_KEY
    vi.stubEnv('NODE_ENV', 'production')
    const fetchSpy = makeFetchMock()
    global.fetch = fetchSpy

    const { turnstileToken: _omit, ...payload } = validContact
    void _omit
    const res = await POST(makeRequest(payload))
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toMatch(/verification service unavailable/i)

    // Cloudflare siteverify must NOT have been called either
    const cloudflareCalled = (fetchSpy.mock.calls as [string][]).some(([url]) =>
      url.includes('cloudflare.com/turnstile'),
    )
    expect(cloudflareCalled).toBe(false)
  })

  // -----------------------------------------------------------------------
  // 8. Webhook forwarding — payload includes full discriminated fields
  // -----------------------------------------------------------------------
  it('forwards full contact payload to the webhook including source field', async () => {
    const fetchSpy = makeFetchMock()
    global.fetch = fetchSpy

    await POST(makeRequest(validContact))

    // Find the webhook call (not the Cloudflare call)
    const webhookCall = (fetchSpy.mock.calls as unknown as [string, RequestInit][]).find(
      ([url]) => !String(url).includes('cloudflare.com'),
    )
    expect(webhookCall).toBeDefined()

    const sentBody = JSON.parse(webhookCall![1].body as string)
    expect(sentBody.fullName).toBe(validContact.fullName)
    expect(sentBody.phone).toBe(validContact.phone)
    expect(sentBody.email).toBe(validContact.email)
    expect(sentBody.businessType).toBe(validContact.businessType)
    expect(sentBody.services).toEqual(validContact.services)
    expect(sentBody.message).toBe(validContact.message)
    // Default source derived from absent `source` + contact type
    expect(sentBody.source).toBe('website-contact-form')
    expect(sentBody.type).toBe('contact')
    // turnstileToken must be stripped from outgoing payload
    expect(sentBody.turnstileToken).toBeUndefined()
  })

  it('sends x-pwa-secret header to webhook', async () => {
    const fetchSpy = makeFetchMock()
    global.fetch = fetchSpy

    await POST(makeRequest(validContact))

    const webhookCall = (fetchSpy.mock.calls as unknown as [string, RequestInit][]).find(
      ([url]) => !String(url).includes('cloudflare.com'),
    )
    expect(webhookCall).toBeDefined()
    const headers = webhookCall![1].headers as Record<string, string>
    expect(headers['x-pwa-secret']).toBe('test-pwa-secret')
  })

  // -----------------------------------------------------------------------
  // 9. Webhook env var missing → webhook skipped. With Supabase also absent,
  //    both durable writes fail → 502.
  // -----------------------------------------------------------------------
  it('returns 502 when PWA_WEBHOOK_SECRET is absent and Supabase is unavailable', async () => {
    delete process.env.PWA_WEBHOOK_SECRET
    const fetchSpy = makeFetchMock()
    global.fetch = fetchSpy

    const res = await POST(makeRequest(validContact))
    expect(res.status).toBe(502)

    // Only the Cloudflare siteverify call should have been made (webhook skipped)
    const webhookCalled = (fetchSpy.mock.calls as unknown as [string][]).some(
      ([url]) => !String(url).includes('cloudflare.com'),
    )
    expect(webhookCalled).toBe(false)
  })

  // -----------------------------------------------------------------------
  // 10. Durable-write failure modes — webhook fails → 502 (when Supabase also absent)
  // -----------------------------------------------------------------------
  it('returns 502 when the webhook returns a non-OK status and Supabase is absent', async () => {
    global.fetch = makeFetchMock({ webhookStatus: 500 })
    const res = await POST(makeRequest(validContact))
    expect(res.status).toBe(502)
  })

  it('returns 502 when the webhook fetch throws and Supabase is absent', async () => {
    global.fetch = makeFetchMock({ webhookThrows: true })
    const res = await POST(makeRequest(validContact))
    expect(res.status).toBe(502)
  })

  // -----------------------------------------------------------------------
  // 11. Booking type passthrough — type/preferredDate/preferredTime/serviceType
  //     appear in the webhook body
  // -----------------------------------------------------------------------
  it('includes booking fields in the webhook payload when type is "booking"', async () => {
    const fetchSpy = makeFetchMock()
    global.fetch = fetchSpy

    await POST(makeRequest(validBooking))

    const webhookCall = (fetchSpy.mock.calls as unknown as [string, RequestInit][]).find(
      ([url]) => !String(url).includes('cloudflare.com'),
    )
    expect(webhookCall).toBeDefined()

    const sentBody = JSON.parse(webhookCall![1].body as string)
    expect(sentBody.type).toBe('booking')
    expect(sentBody.serviceType).toBe(validBooking.serviceType)
    expect(sentBody.preferredDate).toBe(validBooking.preferredDate)
    expect(sentBody.preferredTime).toBe(validBooking.preferredTime)
    expect(sentBody.source).toBe('website-booking')
  })

  it('does not include booking fields in the webhook payload for a contact submission', async () => {
    const fetchSpy = makeFetchMock()
    global.fetch = fetchSpy

    await POST(makeRequest(validContact))

    const webhookCall = (fetchSpy.mock.calls as unknown as [string, RequestInit][]).find(
      ([url]) => !String(url).includes('cloudflare.com'),
    )
    expect(webhookCall).toBeDefined()

    const sentBody = JSON.parse(webhookCall![1].body as string)
    expect(sentBody.type).toBe('contact')
    expect(sentBody.serviceType).toBeUndefined()
    expect(sentBody.preferredDate).toBeUndefined()
    expect(sentBody.preferredTime).toBeUndefined()
  })

  // -----------------------------------------------------------------------
  // 12. Source allowlist — accept known sources, reject unknown
  // -----------------------------------------------------------------------
  it('accepts an allowlisted custom source and forwards it to the webhook', async () => {
    const fetchSpy = makeFetchMock()
    global.fetch = fetchSpy

    await POST(
      makeRequest({
        ...validContact,
        source: 'tool-tax-savings',
      }),
    )

    const webhookCall = (fetchSpy.mock.calls as unknown as [string, RequestInit][]).find(
      ([url]) => !String(url).includes('cloudflare.com'),
    )
    expect(webhookCall).toBeDefined()
    const sentBody = JSON.parse(webhookCall![1].body as string)
    expect(sentBody.source).toBe('tool-tax-savings')
  })

  it('returns 400 when source is not on the allowlist', async () => {
    const res = await POST(
      makeRequest({
        ...validContact,
        source: 'evil-scraper-bot',
      }),
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/unknown source/i)
  })

  // -----------------------------------------------------------------------
  // 13. UTM passthrough
  // -----------------------------------------------------------------------
  it('forwards UTM params to the webhook when provided', async () => {
    const fetchSpy = makeFetchMock()
    global.fetch = fetchSpy

    await POST(
      makeRequest({
        ...validContact,
        utm: {
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'spring-launch',
          referrer: 'https://google.com',
        },
      }),
    )

    const webhookCall = (fetchSpy.mock.calls as unknown as [string, RequestInit][]).find(
      ([url]) => !String(url).includes('cloudflare.com'),
    )
    expect(webhookCall).toBeDefined()
    const sentBody = JSON.parse(webhookCall![1].body as string)
    expect(sentBody.utm).toEqual({
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'spring-launch',
      referrer: 'https://google.com',
    })
  })

  // -----------------------------------------------------------------------
  // 14. Native-form type variants validate + forward
  // -----------------------------------------------------------------------
  it('accepts a client-info submission and forwards it with type=client-info', async () => {
    const fetchSpy = makeFetchMock()
    global.fetch = fetchSpy

    const res = await POST(
      makeRequest({
        fullName: 'Jane Client',
        phone: '9295551212',
        email: 'jane@example.com',
        type: 'client-info',
        serviceInterested: 'Tax Services',
        referralSource: 'Google',
        turnstileToken: 'valid-token',
      }),
    )
    expect(res.status).toBe(200)

    const webhookCall = (fetchSpy.mock.calls as unknown as [string, RequestInit][]).find(
      ([url]) => !String(url).includes('cloudflare.com'),
    )
    const sentBody = JSON.parse(webhookCall![1].body as string)
    expect(sentBody.type).toBe('client-info')
    expect(sentBody.serviceInterested).toBe('Tax Services')
    expect(sentBody.source).toBe('website-client-info')
  })

  // -----------------------------------------------------------------------
  // Edge: non-JSON body → 400
  // -----------------------------------------------------------------------
  it('returns 400 when the request body is not valid JSON', async () => {
    const req = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: 'this is not json',
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
  })
})
