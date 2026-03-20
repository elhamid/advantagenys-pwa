import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { ShareButton } from '../ShareButton'

vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: { children: React.ReactNode }) => (
      <button type="button" {...props}>
        {children}
      </button>
    ),
    span: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    svg: ({ children }: { children: React.ReactNode }) => <svg>{children}</svg>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ShareButton', () => {
  it('copies a relative URL to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
    })

    render(<ShareButton title="Contact" url="/contact" variant="copy" />)

    fireEvent.click(screen.getByRole('button', { name: /copy link/i }))

    expect(writeText).toHaveBeenCalledWith('https://advantagenys.com/contact')
  })

  it('opens WhatsApp sharing', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)

    render(<ShareButton title="Contact" url="/contact" variant="whatsapp" />)

    fireEvent.click(screen.getByRole('button', { name: /share via whatsapp/i }))

    expect(open).toHaveBeenCalledWith(
      expect.stringContaining('wa.me'),
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('renders the full share button and updates after copy', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
    })

    render(<ShareButton title="Contact" url="/contact" />)

    fireEvent.click(screen.getByRole('button', { name: /share contact/i }))

    await waitFor(() => expect(writeText).toHaveBeenCalled())
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /share contact/i })).toHaveTextContent(
        /link copied/i,
      ),
    )
  })
})
