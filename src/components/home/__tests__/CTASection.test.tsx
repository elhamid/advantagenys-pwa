import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CTASection } from '../CTASection'

vi.mock('@/components/ui/Container', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/Button', () => ({
  Button: ({ href, children }: { href?: string; children: React.ReactNode }) =>
    href ? <a href={href}>{children}</a> : <button type="button">{children}</button>,
}))

describe('CTASection', () => {
  it('renders the main CTA and contact links', () => {
    render(<CTASection />)

    expect(screen.getByText(/ready to get started/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /schedule a call/i })).toHaveAttribute(
      'href',
      '/contact',
    )
    expect(screen.getByRole('link', { name: /whatsapp us/i })).toHaveAttribute(
      'href',
      'https://wa.me/19299331396',
    )
    expect(screen.getByRole('link', { name: /929-933-1396/i })).toHaveAttribute(
      'href',
      'tel:+19299331396',
    )
  })
})
