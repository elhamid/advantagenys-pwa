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

// Silence analytics in tests
vi.mock('@/lib/analytics/events', () => ({
  bookingSubmit: vi.fn(),
  bookingTriggerOpen: vi.fn(),
  bookingRedirectClick: vi.fn(),
  bookingIframeOpen: vi.fn(),
  bookingIframeConfirmed: vi.fn(),
  messageSubmit: vi.fn(),
}))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('BookingForm', () => {
  // ---------------------------------------------------------------------------
  // 1. Renders all booking-specific fields (no date or time inputs)
  // ---------------------------------------------------------------------------
  it('renders required booking fields and preferred-window chips', () => {
    render(<BookingForm />)

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    // Email is optional — label should NOT carry a red asterisk
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/service type/i)).toBeInTheDocument()
    // No date picker or time picker
    expect(screen.queryByLabelText(/preferred date/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/preferred time/i)).not.toBeInTheDocument()
    // Window chips
    expect(screen.getByRole('button', { name: /mornings/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /afternoons/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /evenings/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /weekends/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /book appointment/i })).toBeInTheDocument()
  })

  // ---------------------------------------------------------------------------
  // 2. Email is optional — no required attribute
  // ---------------------------------------------------------------------------
  it('email input does not have the required attribute', () => {
    render(<BookingForm />)
    const emailInput = screen.getByLabelText(/email/i)
    expect(emailInput).not.toHaveAttribute('required')
  })

  // ---------------------------------------------------------------------------
  // 3. Window chip toggle
  // ---------------------------------------------------------------------------
  it('toggles preferred window chips on click', async () => {
    const user = userEvent.setup()
    render(<BookingForm />)

    const morningBtn = screen.getByRole('button', { name: /mornings/i })
    expect(morningBtn).toHaveAttribute('aria-pressed', 'false')

    await user.click(morningBtn)
    expect(morningBtn).toHaveAttribute('aria-pressed', 'true')

    await user.click(morningBtn)
    expect(morningBtn).toHaveAttribute('aria-pressed', 'false')
  })

  // ---------------------------------------------------------------------------
  // 4. Submit sends new payload shape — no date/time, yes wantsAppointment + preferredWindow
  // ---------------------------------------------------------------------------
  it('sends type "booking", source "advantagenys.com_book_appointment", wantsAppointment: true, preferredWindow in POST body', async () => {
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
    // Skip email (optional)

    // Select a service type — using the new 6-item list
    await user.selectOptions(screen.getByLabelText(/service type/i), 'Tax')

    // Toggle two window chips
    await user.click(screen.getByRole('button', { name: /mornings/i }))
    await user.click(screen.getByRole('button', { name: /weekends/i }))

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
    expect(body.preferredWindow).toContain('Mornings')
    expect(body.preferredWindow).toContain('Weekends')
    expect(body.serviceType).toBe('Tax')
    expect(body.turnstileToken).toBe('test-token')
    // Old date/time fields must NOT be present
    expect(body.preferredDate).toBeUndefined()
    expect(body.preferredTime).toBeUndefined()
  })

  // ---------------------------------------------------------------------------
  // 5. Successful submission — shows updated confirmation copy
  // ---------------------------------------------------------------------------
  it('shows Jay/Kedar confirmation copy after a 200 response', async () => {
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

    // Confirmation card replaces the form
    expect(screen.queryByRole('button', { name: /book appointment/i })).not.toBeInTheDocument()
    // Updated confirmation copy
    expect(screen.getByText(/jay or kedar will reach out within 24 hours/i)).toBeInTheDocument()
  })

  // ---------------------------------------------------------------------------
  // 6. Network/API error still shows success (graceful degradation)
  // ---------------------------------------------------------------------------
  it('shows success state even when fetch rejects (graceful degradation)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')))

    const user = userEvent.setup()
    render(<BookingForm />)

    await user.type(screen.getByLabelText(/full name/i), 'Test User')
    await user.type(screen.getByLabelText(/phone number/i), '9299290002')
    await user.selectOptions(screen.getByLabelText(/service type/i), 'Insurance')

    await user.click(screen.getByRole('button', { name: /book appointment/i }))

    await waitFor(() => {
      expect(screen.getByText(/thanks, test user/i)).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // 7. Loading state — button shows "Submitting..." while in-flight
  // ---------------------------------------------------------------------------
  it('shows "Submitting..." on the button while the request is in-flight', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))

    const user = userEvent.setup()
    render(<BookingForm />)

    await user.type(screen.getByLabelText(/full name/i), 'In Flight')
    await user.type(screen.getByLabelText(/phone number/i), '9299290003')
    await user.selectOptions(screen.getByLabelText(/service type/i), 'Insurance')

    await user.click(screen.getByRole('button', { name: /book appointment/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submitting\.\.\./i })).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /submitting\.\.\./i })).toBeDisabled()
  })
})
