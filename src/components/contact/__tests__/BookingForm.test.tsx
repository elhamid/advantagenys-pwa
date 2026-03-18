import { render, screen, waitFor, fireEvent } from '@testing-library/react'
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

afterEach(() => {
  vi.restoreAllMocks()
})

describe('BookingForm', () => {
  // ---------------------------------------------------------------------------
  // 1. Renders all booking-specific fields
  // ---------------------------------------------------------------------------
  it('renders all booking fields', () => {
    render(<BookingForm />)

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    // Email is required on the booking form (unlike ContactForm where it is optional)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/service type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/preferred date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/preferred time/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/brief description/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /book appointment/i })).toBeInTheDocument()
  })

  // ---------------------------------------------------------------------------
  // 2. Min date constraint — date input must not allow past dates
  // ---------------------------------------------------------------------------
  it('sets the min attribute on the date input to today\'s ISO date', () => {
    render(<BookingForm />)

    const dateInput = screen.getByLabelText(/preferred date/i)
    const todayIso = new Date().toISOString().split('T')[0]
    expect(dateInput).toHaveAttribute('min', todayIso)
  })

  // ---------------------------------------------------------------------------
  // 3. Submit sends booking fields including type: "booking"
  // ---------------------------------------------------------------------------
  it('sends type: "booking", preferredDate, preferredTime, and serviceType in the POST body', async () => {
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
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')

    // Select a service type
    await user.selectOptions(screen.getByLabelText(/service type/i), 'Tax Services')

    // Set a preferred date using fireEvent (userEvent.type unreliable for date inputs in jsdom)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowIso = tomorrow.toISOString().split('T')[0]
    fireEvent.change(screen.getByLabelText(/preferred date/i), { target: { value: tomorrowIso } })

    // Select a time slot
    await user.selectOptions(screen.getByLabelText(/preferred time/i), 'morning')

    await user.click(screen.getByRole('button', { name: /book appointment/i }))

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledOnce()
    })

    const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/contact')
    const body = JSON.parse(options.body as string)

    expect(body.type).toBe('booking')
    expect(body.serviceType).toBe('Tax Services')
    expect(body.preferredDate).toBe(tomorrowIso)
    expect(body.preferredTime).toBe('morning')
    expect(body.turnstileToken).toBe('test-token')
  })

  // ---------------------------------------------------------------------------
  // 4. Successful submission — shows success/confirmation state
  // ---------------------------------------------------------------------------
  it('shows success state after a 200 response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    }))

    const user = userEvent.setup()
    render(<BookingForm />)

    await user.type(screen.getByLabelText(/full name/i), 'Maria Garcia')
    await user.type(screen.getByLabelText(/phone number/i), '9299290001')
    await user.type(screen.getByLabelText(/email/i), 'maria@example.com')
    await user.selectOptions(screen.getByLabelText(/service type/i), 'ITIN/Tax ID')

    await user.click(screen.getByRole('button', { name: /book appointment/i }))

    await waitFor(() => {
      expect(screen.getByText(/thank you, maria garcia/i)).toBeInTheDocument()
    })

    // Confirmation card replaces the form
    expect(screen.queryByRole('button', { name: /book appointment/i })).not.toBeInTheDocument()
    // Confirmation message contains appointment language
    expect(screen.getByText(/confirm your appointment/i)).toBeInTheDocument()
  })

  // ---------------------------------------------------------------------------
  // 5. Network/API error still shows success (BookingForm treats errors as success
  //    by design: "treat as success for now" comment in component)
  // ---------------------------------------------------------------------------
  it('shows success state even when fetch rejects (graceful degradation)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')))

    const user = userEvent.setup()
    render(<BookingForm />)

    await user.type(screen.getByLabelText(/full name/i), 'Test User')
    await user.type(screen.getByLabelText(/phone number/i), '9299290002')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.selectOptions(screen.getByLabelText(/service type/i), 'Licensing')

    await user.click(screen.getByRole('button', { name: /book appointment/i }))

    await waitFor(() => {
      expect(screen.getByText(/thank you, test user/i)).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // 6. Loading state — button shows "Submitting..." while in-flight
  // ---------------------------------------------------------------------------
  it('shows "Submitting..." on the button while the request is in-flight', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))

    const user = userEvent.setup()
    render(<BookingForm />)

    await user.type(screen.getByLabelText(/full name/i), 'In Flight')
    await user.type(screen.getByLabelText(/phone number/i), '9299290003')
    await user.type(screen.getByLabelText(/email/i), 'inflight@example.com')
    await user.selectOptions(screen.getByLabelText(/service type/i), 'Insurance')

    await user.click(screen.getByRole('button', { name: /book appointment/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submitting\.\.\./i })).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /submitting\.\.\./i })).toBeDisabled()
  })
})
