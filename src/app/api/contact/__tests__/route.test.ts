import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../route'

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
//   anything else          → 200 OK (webhook stub)
function makeFetchMock({
  turnstileSuccess = true,
  webhookStatus = 200,
  webhookThrows = false,
  jotformStatus = 200,
}: {
  turnstileSuccess?: boolean
  webhookStatus?: number
  webhookThrows?: boolean
  jotformStatus?: number
} = {}) {
  return vi.fn(async (url: string | URL | Request) => {
    const urlStr = typeof url === 'string' ? url : url instanceof URL ? url.href : url.url

    if (urlStr.includes('cloudflare.com/turnstile')) {
      return {
        json: async () => ({ success: turnstileSuccess }),
        ok: true,
      } as unknown as Response
    }

    if (urlStr.includes('api.jotform.com')) {
      return {
        ok: jotformStatus >= 200 && jotformStatus < 300,
        status: jotformStatus,
        text: async () => 'jotform error body',
        json: async () => ({ content: { submissionID: 'jf-submission-1' } }),
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
  const originalJotformApiKey = process.env.JOTFORM_API_KEY

  beforeEach(() => {
    // Restore baseline env before every test
    process.env.TURNSTILE_SECRET_KEY = originalTurnstileKey
    process.env.TASKBOARD_WEBHOOK_URL = originalWebhookUrl
    // Ensure webhook secret is present for webhook-related tests by default
    process.env.PWA_WEBHOOK_SECRET = 'test-pwa-secret'
    process.env.JOTFORM_API_KEY = 'test-jotform-key'
    global.fetch = makeFetchMock()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    process.env.PWA_WEBHOOK_SECRET = originalWebhookSecret
    process.env.JOTFORM_API_KEY = originalJotformApiKey
  })

  // -----------------------------------------------------------------------
  // 1. Valid contact payload → 200
  // -----------------------------------------------------------------------
  it('returns 200 and success:true for a valid contact payload', async () => {
    const res = await POST(makeRequest(validContact))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  // -----------------------------------------------------------------------
  // 2. Valid booking payload → 200 + booking fields preserved in response
  // -----------------------------------------------------------------------
  it('returns 200 and success:true for a valid booking payload', async () => {
    const res = await POST(makeRequest(validBooking))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  // -----------------------------------------------------------------------
  // 3. Missing fullName → 400
  // -----------------------------------------------------------------------
  it('returns 400 when fullName is missing', async () => {
    const payload: Partial<typeof validContact> = { ...validContact }
    delete payload.fullName
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
    const payload: Partial<typeof validContact> = { ...validContact }
    delete payload.phone
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
    const payload: Partial<typeof validContact> = { ...validContact }
    delete payload.email
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
    const payload: Partial<typeof validContact> = { ...validContact }
    delete payload.turnstileToken
    const res = await POST(makeRequest(payload))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toMatch(/human verification/i)
  })

  it('allows known native service forms without a Turnstile token and forwards their source', async () => {
    const fetchSpy = makeFetchMock()
    global.fetch = fetchSpy
    const payload = {
      type: 'client-info',
      source: 'website-client-info',
      fullName: 'JANE CLIENT',
      phone: '9295550101',
      email: 'jane@example.com',
      services: ['Tax Services'],
      serviceType: 'Tax Services',
      fullLegalName: 'Jane Client',
      formSendId: 'event-client-info',
    }

    const res = await POST(makeRequest(payload))
    expect(res.status).toBe(200)

    const cloudflareCalled = (fetchSpy.mock.calls as [string][]).some(([url]) =>
      String(url).includes('cloudflare.com/turnstile'),
    )
    expect(cloudflareCalled).toBe(false)

    const webhookCall = (fetchSpy.mock.calls as unknown as [string, RequestInit][]).find(
      ([url]) => !String(url).includes('cloudflare.com'),
    )
    expect(webhookCall).toBeDefined()
    const sentBody = JSON.parse(webhookCall![1].body as string)
    expect(sentBody).toMatchObject({
      type: 'client-info',
      source: 'website-client-info',
      fullName: 'JANE CLIENT',
      services: ['Tax Services'],
      serviceType: 'Tax Services',
      formSendId: 'event-client-info',
      sendId: 'event-client-info',
      form_send_id: 'event-client-info',
    })
  })

  it('copies native corporation forms to the matching Jotform backup form without blocking taskboard', async () => {
    const fetchSpy = makeFetchMock()
    global.fetch = fetchSpy
    const payload = {
      type: 'corporate-registration',
      source: 'website-corporate-registration',
      fullName: 'Alex Owner',
      ownerName: 'Alex Owner',
      phone: '9295550102',
      email: 'alex@example.com',
      desiredBusinessName: 'Alex LLC',
      businessName: 'Alex LLC',
      businessType: 'LLC',
      services: ['Business Formation'],
      serviceType: 'Business Formation',
      sharedBy: 'staff-user-123',
      sharedByName: 'Kedar',
      utmSource: 'advantageos',
      utmMedium: 'staff_share',
      utmCampaign: 'form_share',
    }

    const res = await POST(makeRequest(payload))
    expect(res.status).toBe(200)
    const responseBody = await res.json()
    expect(responseBody.backup).toMatchObject({
      jotform: true,
      formId: '220796553658166',
      submissionId: 'jf-submission-1',
    })

    const jotformCall = (fetchSpy.mock.calls as unknown as [string, RequestInit][]).find(
      ([url]) => String(url).includes('api.jotform.com/form/220796553658166/submissions'),
    )
    expect(jotformCall).toBeDefined()
    const body = jotformCall![1].body as string
    expect(body).toContain('submission%5B94%5D=ALEX+LLC')
    expect(body).toContain('submission%5B74%5D=')
    const traceNote = new URLSearchParams(body).get('submission[74]')
    expect(traceNote).toContain('Shared-by id: staff-user-123')
    expect(traceNote).not.toContain('Kedar')
  })

  it('skips Turnstile check when TURNSTILE_SECRET_KEY is not set', async () => {
    delete process.env.TURNSTILE_SECRET_KEY
    const fetchSpy = makeFetchMock()
    global.fetch = fetchSpy
    // Omit token — should still succeed because the key is absent
    const payload: Partial<typeof validContact> = { ...validContact }
    delete payload.turnstileToken
    const res = await POST(makeRequest(payload))
    expect(res.status).toBe(200)
    // Cloudflare siteverify must NOT have been called
    const cloudflareCalled = (fetchSpy.mock.calls as [string][]).some(([url]) =>
      url.includes('cloudflare.com/turnstile'),
    )
    expect(cloudflareCalled).toBe(false)
  })

  // -----------------------------------------------------------------------
  // 8. Webhook forwarding — payload includes all contact fields + source
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
    expect(sentBody.source).toBe('website-contact-form')
  })

  it('forwards tracked form send aliases to the webhook', async () => {
    const fetchSpy = makeFetchMock()
    global.fetch = fetchSpy

    await POST(makeRequest({
      ...validContact,
      sharedBy: 'staff-user-1',
      utmSource: 'advantageos',
      utmMedium: 'staff_share',
      utmCampaign: 'form_share',
      formSendId: 'event-contact-1',
    }))

    const webhookCall = (fetchSpy.mock.calls as unknown as [string, RequestInit][]).find(
      ([url]) => !String(url).includes('cloudflare.com'),
    )
    expect(webhookCall).toBeDefined()

    const sentBody = JSON.parse(webhookCall![1].body as string)
    expect(sentBody.sharedBy).toBe('staff-user-1')
    expect(sentBody.utmSource).toBe('advantageos')
    expect(sentBody.utmMedium).toBe('staff_share')
    expect(sentBody.utmCampaign).toBe('form_share')
    expect(sentBody.formSendId).toBe('event-contact-1')
    expect(sentBody.sendId).toBe('event-contact-1')
    expect(sentBody.form_send_id).toBe('event-contact-1')
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
  // 9. Webhook env var missing → skip webhook, 502 if Supabase also failed
  // -----------------------------------------------------------------------
  it('does not call webhook when PWA_WEBHOOK_SECRET is absent', async () => {
    delete process.env.PWA_WEBHOOK_SECRET
    const fetchSpy = makeFetchMock()
    global.fetch = fetchSpy

    const res = await POST(makeRequest(validContact))

    // Only the Cloudflare siteverify call should have been made (if at all)
    const webhookCalled = (fetchSpy.mock.calls as unknown as [string][]).some(
      ([url]) => !String(url).includes('cloudflare.com'),
    )
    expect(webhookCalled).toBe(false)

    // With no Supabase mock AND no webhook, both durable writes fail → 502
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(res.status).toBe(502)
  })

  // -----------------------------------------------------------------------
  // 10. Webhook failure — returns 502 when both Supabase and webhook fail
  // -----------------------------------------------------------------------
  it('returns 502 when both Supabase and webhook fail (non-OK status)', async () => {
    global.fetch = makeFetchMock({ webhookStatus: 500 })
    const res = await POST(makeRequest(validContact))
    // Supabase is not mocked, so it returns false; webhook returned 500 → both fail
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toMatch(/call us/i)
  })

  it('returns 502 when both Supabase and webhook fail (network error)', async () => {
    global.fetch = makeFetchMock({ webhookThrows: true })
    const res = await POST(makeRequest(validContact))
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.success).toBe(false)
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
    expect(sentBody.type).toBeUndefined()
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

  it('preserves staff shared form attribution in the webhook payload', async () => {
    const fetchSpy = makeFetchMock()
    global.fetch = fetchSpy

    await POST(
      makeRequest({
        ...validContact,
        sharedBy: 'user-hamid',
      }),
    )

    const webhookCall = (fetchSpy.mock.calls as unknown as [string, RequestInit][]).find(
      ([url]) => !String(url).includes('cloudflare.com'),
    )
    expect(webhookCall).toBeDefined()
    const sentBody = JSON.parse(webhookCall![1].body as string)
    expect(sentBody.sharedBy).toBe('user-hamid')
  })

  it('preserves form send id attribution in the webhook payload', async () => {
    const fetchSpy = makeFetchMock()
    global.fetch = fetchSpy

    await POST(
      makeRequest({
        ...validContact,
        sharedBy: 'user-hamid',
        formSendId: 'send-abc',
      }),
    )

    const webhookCall = (fetchSpy.mock.calls as unknown as [string, RequestInit][]).find(
      ([url]) => !String(url).includes('cloudflare.com'),
    )
    expect(webhookCall).toBeDefined()
    const sentBody = JSON.parse(webhookCall![1].body as string)
    expect(sentBody.formSendId).toBe('send-abc')
    expect(sentBody.send_id).toBe('send-abc')
    expect(sentBody.form_send_id).toBe('send-abc')
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
        ssnOrItin: '123-45-6789',
        turnstileToken: 'valid-token',
      }),
    )
    expect(res.status).toBe(200)

    const webhookCall = (fetchSpy.mock.calls as unknown as [string, RequestInit][]).find(
      ([url]) => !String(url).includes('cloudflare.com'),
    )
    const sentBody = JSON.parse(webhookCall![1].body as string)
    expect(sentBody.type).toBe('client-info')
    expect(sentBody.fullName).toBe('JANE CLIENT')
    expect(sentBody.serviceInterested).toBe('TAX SERVICES')
    expect(sentBody.ssnOrItin).toBe('123-45-6789')
    expect(sentBody.source).toBe('website-client-info')
  })

  it('forwards full corporate registration identifiers to the Taskboard staff packet', async () => {
    const fetchSpy = makeFetchMock()
    global.fetch = fetchSpy

    const res = await POST(
      makeRequest({
        fullName: 'Alex Owner',
        phone: '9295550102',
        email: 'alex@example.com',
        type: 'corporate-registration',
        desiredBusinessName: 'Alex LLC',
        businessType: 'LLC',
        ownerSsnOrItin: '123-45-6789',
        ownerDateOfBirth: '1990-01-15',
        additionalOwner2Name: 'Second Owner',
        additionalOwner2SsnOrItin: '987-65-4321',
        additionalOwners: [
          {
            name: 'Second Owner',
            ssnOrItin: '987-65-4321',
            dateOfBirth: '1991-02-16',
          },
        ],
        turnstileToken: 'valid-token',
      }),
    )
    expect(res.status).toBe(200)

    const webhookCall = (fetchSpy.mock.calls as unknown as [string, RequestInit][]).find(
      ([url]) => !String(url).includes('cloudflare.com'),
    )
    expect(webhookCall).toBeDefined()
    const sentBody = JSON.parse(webhookCall![1].body as string)
    expect(sentBody.type).toBe('corporate-registration')
    expect(sentBody.fullName).toBe('ALEX OWNER')
    expect(sentBody.desiredBusinessName).toBe('ALEX LLC')
    expect(sentBody.ownerSsnOrItin).toBe('123-45-6789')
    expect(sentBody.additionalOwner2SsnOrItin).toBe('987-65-4321')
    expect(sentBody.additionalOwner2Name).toBe('SECOND OWNER')
    expect(sentBody.additionalOwners[0].name).toBe('SECOND OWNER')
    expect(sentBody.additionalOwners[0].ssnOrItin).toBe('987-65-4321')
    expect(sentBody.source).toBe('website-corporate-registration')
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
