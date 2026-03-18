import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, afterEach } from 'vitest'
import { ContactForm } from '../ContactForm'

// Mock @marsidev/react-turnstile — call onSuccess immediately with the test token
vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: ({ onSuccess }: { onSuccess?: (token: string) => void }) => {
    onSuccess?.('test-token')
    return null
  },
}))

// Mock Next.js navigation (not used by ContactForm directly, but guards against
// any transitive import that references next/navigation)
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
}))

function buildFetchMock(status: number, body: object) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ContactForm', () => {
  // ---------------------------------------------------------------------------
  // 1. Renders all fields
  // ---------------------------------------------------------------------------
  it('renders all required fields and controls', () => {
    render(<ContactForm />)

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/business type/i)).toBeInTheDocument()
    // Services checkboxes — spot-check two
    expect(screen.getByLabelText(/business formation/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tax services/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/brief message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /request free consultation/i })).toBeInTheDocument()
  })

  // ---------------------------------------------------------------------------
  // 2. Required-field validation via HTML5 (no custom client-side error text)
  // ---------------------------------------------------------------------------
  it('does not call fetch when required fields are empty', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    const user = userEvent.setup()
    render(<ContactForm />)

    await user.click(screen.getByRole('button', { name: /request free consultation/i }))

    // HTML5 validation blocks submission; fetch must not be called
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  // ---------------------------------------------------------------------------
  // 3. Successful submission
  // ---------------------------------------------------------------------------
  it('shows success message and resets form after a 200 response', async () => {
    vi.stubGlobal(
      'fetch',
      buildFetchMock(200, { success: true }),
    )

    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe')
    await user.type(screen.getByLabelText(/phone number/i), '9299290000')

    await user.click(screen.getByRole('button', { name: /request free consultation/i }))

    await waitFor(() => {
      expect(screen.getByText(/thank you, jane doe/i)).toBeInTheDocument()
    })

    // Success card replaces the form — submit button should be gone
    expect(screen.queryByRole('button', { name: /request free consultation/i })).not.toBeInTheDocument()
  })

  // ---------------------------------------------------------------------------
  // 4. API error — non-OK response with error field
  // ---------------------------------------------------------------------------
  it('displays error message when the API returns a 500', async () => {
    vi.stubGlobal(
      'fetch',
      buildFetchMock(500, { success: false, error: 'Server error' }),
    )

    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe')
    await user.type(screen.getByLabelText(/phone number/i), '9299290000')

    await user.click(screen.getByRole('button', { name: /request free consultation/i }))

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument()
    })

    // Form stays visible so the user can retry
    expect(screen.getByRole('button', { name: /request free consultation/i })).toBeInTheDocument()
  })

  // ---------------------------------------------------------------------------
  // 5. API error — successful HTTP status but success: false in JSON body
  // ---------------------------------------------------------------------------
  it('displays error message when success flag is false in the response body', async () => {
    vi.stubGlobal(
      'fetch',
      buildFetchMock(200, { success: false, error: 'Validation failed' }),
    )

    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe')
    await user.type(screen.getByLabelText(/phone number/i), '9299290000')

    await user.click(screen.getByRole('button', { name: /request free consultation/i }))

    await waitFor(() => {
      expect(screen.getByText(/validation failed/i)).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // 6. Loading state
  // ---------------------------------------------------------------------------
  it('shows "Sending..." on the submit button while the request is in-flight', async () => {
    // Never resolves so we can inspect the in-flight state
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))

    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe')
    await user.type(screen.getByLabelText(/phone number/i), '9299290000')

    await user.click(screen.getByRole('button', { name: /request free consultation/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sending\.\.\./i })).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /sending\.\.\./i })).toBeDisabled()
  })

  // ---------------------------------------------------------------------------
  // 7. Turnstile token included in POST body
  // ---------------------------------------------------------------------------
  it('includes the Turnstile token in the POST body', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    })
    vi.stubGlobal('fetch', fetchSpy)

    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe')
    await user.type(screen.getByLabelText(/phone number/i), '9299290000')

    await user.click(screen.getByRole('button', { name: /request free consultation/i }))

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledOnce()
    })

    const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/contact')
    const body = JSON.parse(options.body as string)
    expect(body.turnstileToken).toBe('test-token')
  })
})
