import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, afterEach } from 'vitest'
import { BookingForm } from '../BookingForm'

// Mock @marsidev/react-turnstile — call onSuccess immediately with the test token
vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: ({ onSuccess }: { onSuccess?: (token: string) => void }) => {
    onSuccess?.('test-token')
    return null
  },
}))

// Guard against transitive next/navigation imports
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
}))

// Mock analytics so bookingSubmit is trackable
vi.mock('@/lib/analytics/events', () => ({
  formStart: vi.fn(),
  bookingSubmit: vi.fn(),
}))

import * as events from '@/lib/analytics/events'

afterEach(() => {
  vi.clearAllMocks()
})

describe('BookingForm', () => {
  // ---------------------------------------------------------------------------
  // 1. Renders the new booking-specific fields
  // ---------------------------------------------------------------------------
  it('renders all booking fields', () => {
    render(<BookingForm />)

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    // Email is optional in the new form
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/service type/i)).toBeInTheDocument()
    // Preferred window chips
    expect(screen.getByRole('button', { name: 'Mornings' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Afternoons' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Evenings' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Weekends' })).toBeInTheDocument()
    expect(screen.getByLabelText(/brief description/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /book appointment/i })).toBeInTheDocument()
  })

  // ---------------------------------------------------------------------------
  // 2. Window chips toggle on/off (multi-select)
  // ---------------------------------------------------------------------------
  it('toggles preferred window chips correctly', async () => {
    const user = userEvent.setup()
    render(<BookingForm />)

    const morningsBtn = screen.getByRole('button', { name: 'Mornings' })
    const eveningsBtn = screen.getByRole('button', { name: 'Evenings' })

    // Neither active initially
    expect(morningsBtn).toHaveAttribute('aria-pressed', 'false')
    expect(eveningsBtn).toHaveAttribute('aria-pressed', 'false')

    await user.click(morningsBtn)
    expect(morningsBtn).toHaveAttribute('aria-pressed', 'true')
    expect(eveningsBtn).toHaveAttribute('aria-pressed', 'false')

    await user.click(eveningsBtn)
    expect(morningsBtn).toHaveAttribute('aria-pressed', 'true')
    expect(eveningsBtn).toHaveAttribute('aria-pressed', 'true')

    // Toggle off
    await user.click(morningsBtn)
    expect(morningsBtn).toHaveAttribute('aria-pressed', 'false')
    expect(eveningsBtn).toHaveAttribute('aria-pressed', 'true')
  })

  // ---------------------------------------------------------------------------
  // 3. Submit sends new payload shape
  // ---------------------------------------------------------------------------
  it('sends type:"booking", source:"advantagenys.com_book_appointment", wantsAppointment:true, and preferredWindow in the POST body', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    })
    vi.stubGlobal('fetch', fetchSpy)

    const user = userEvent.setup()
    render(<BookingForm />)

    await user.type(screen.getByLabelText(/full name/i), 'John Smith')
    await user.type(screen.getByLabelText(/phone number/i), '9299290000')
    // Email is optional — skip it

    // Select a service type
    await user.selectOptions(screen.getByLabelText(/service type/i), 'Tax')

    // Select some window chips
    await user.click(screen.getByRole('button', { name: 'Mornings' }))
    await user.click(screen.getByRole('button', { name: 'Evenings' }))

    await user.click(screen.getByRole('button', { name: /book appointment/i }))

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledOnce()
    })

    const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/contact')
    const body = JSON.parse(options.body as string)

    expect(body.type).toBe('booking')
    expect(body.source).toBe('advantagenys.com_book_appointment')
    expect(body.wantsAppointment).toBe(true)
    expect(body.preferredWindow).toEqual(['Mornings', 'Evenings'])
    expect(body.serviceType).toBe('Tax')
    expect(body.turnstileToken).toBe('test-token')
    // Old date/time fields must NOT be present
    expect(body.preferredDate).toBeUndefined()
    expect(body.preferredTime).toBeUndefined()
  })

  // ---------------------------------------------------------------------------
  // 4. Success path — shows confirmation copy mentioning Jay or Kedar
  // ---------------------------------------------------------------------------
  it('shows "Jay or Kedar will reach out within 24 hours" after a 200 response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    }))

    const user = userEvent.setup()
    render(<BookingForm />)

    await user.type(screen.getByLabelText(/full name/i), 'Maria Garcia')
    await user.type(screen.getByLabelText(/phone number/i), '9299290001')
    await user.selectOptions(screen.getByLabelText(/service type/i), 'ITIN')

    await user.click(screen.getByRole('button', { name: /book appointment/i }))

    await waitFor(() => {
      expect(screen.getByText(/thanks, maria garcia/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/jay or kedar will reach out within 24 hours/i)).toBeInTheDocument()
    // Confirmation card replaces the form
    expect(screen.queryByRole('button', { name: /book appointment/i })).not.toBeInTheDocument()
  })

  // ---------------------------------------------------------------------------
  // 5. Success path — bookingSubmit() fires, setSubmitted(true) fires
  // ---------------------------------------------------------------------------
  it('fires bookingSubmit() analytics and marks submitted only on res.ok + data.success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    }))

    const user = userEvent.setup()
    render(<BookingForm />)

    await user.type(screen.getByLabelText(/full name/i), 'Ana Lee')
    await user.type(screen.getByLabelText(/phone number/i), '9299290009')
    await user.selectOptions(screen.getByLabelText(/service type/i), 'Consulting')

    await user.click(screen.getByRole('button', { name: /book appointment/i }))

    await waitFor(() => {
      expect(events.bookingSubmit).toHaveBeenCalledOnce()
    })

    expect(screen.queryByRole('button', { name: /book appointment/i })).not.toBeInTheDocument()
  })

  // ---------------------------------------------------------------------------
  // 6. Error path — does NOT set submitted, does NOT fire bookingSubmit()
  // ---------------------------------------------------------------------------
  it('on fetch rejection: surfaces error, does NOT mark submitted, does NOT fire bookingSubmit()', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')))

    const user = userEvent.setup()
    render(<BookingForm />)

    await user.type(screen.getByLabelText(/full name/i), 'Test User')
    await user.type(screen.getByLabelText(/phone number/i), '9299290002')
    await user.selectOptions(screen.getByLabelText(/service type/i), 'Tax')

    await user.click(screen.getByRole('button', { name: /book appointment/i }))

    await waitFor(() => {
      expect(screen.getByText(/network failure/i)).toBeInTheDocument()
    })

    // Form must remain visible so user can retry — no silent drop
    expect(screen.getByRole('button', { name: /book appointment/i })).toBeInTheDocument()
    expect(screen.queryByText(/thanks, test user/i)).not.toBeInTheDocument()
    expect(events.bookingSubmit).not.toHaveBeenCalled()
  })

  // ---------------------------------------------------------------------------
  // 7. API error (res.ok=true but data.success=false) — does NOT mark submitted
  // ---------------------------------------------------------------------------
  it('on API error response: surfaces error, does NOT mark submitted, does NOT fire bookingSubmit()', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ success: false, error: 'Bad request' }),
    }))

    const user = userEvent.setup()
    render(<BookingForm />)

    await user.type(screen.getByLabelText(/full name/i), 'Error User')
    await user.type(screen.getByLabelText(/phone number/i), '9299290003')
    await user.selectOptions(screen.getByLabelText(/service type/i), 'Insurance')

    await user.click(screen.getByRole('button', { name: /book appointment/i }))

    await waitFor(() => {
      expect(screen.getByText(/bad request/i)).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /book appointment/i })).toBeInTheDocument()
    expect(events.bookingSubmit).not.toHaveBeenCalled()
  })

  // ---------------------------------------------------------------------------
  // 8. Loading state — button shows "Submitting..." while in-flight
  // ---------------------------------------------------------------------------
  it('shows "Submitting..." on the button while the request is in-flight', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))

    const user = userEvent.setup()
    render(<BookingForm />)

    await user.type(screen.getByLabelText(/full name/i), 'In Flight')
    await user.type(screen.getByLabelText(/phone number/i), '9299290004')
    await user.selectOptions(screen.getByLabelText(/service type/i), 'Insurance')

    await user.click(screen.getByRole('button', { name: /book appointment/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submitting\.\.\./i })).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /submitting\.\.\./i })).toBeDisabled()
  })

  // ---------------------------------------------------------------------------
  // 9. defaultService prop syncs into service dropdown
  // ---------------------------------------------------------------------------
  it('pre-fills service dropdown from defaultService prop', () => {
    render(<BookingForm defaultService="Tax" />)
    const select = screen.getByLabelText(/service type/i) as HTMLSelectElement
    expect(select.value).toBe('Tax')
  })
})
