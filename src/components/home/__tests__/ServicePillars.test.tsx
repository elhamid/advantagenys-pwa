import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ServicePillars } from '../ServicePillars'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/components/ui/Container', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/Card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/ScrollReveal', () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('ServicePillars', () => {
  it('renders the service pillars and their links', () => {
    render(<ServicePillars />)

    expect(screen.getByText(/everything your business needs/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /business formation/i })).toHaveAttribute(
      'href',
      '/services/business-formation/',
    )
    expect(screen.getByRole('link', { name: /tax services/i })).toHaveAttribute(
      'href',
      '/services/tax-services/',
    )
  })
})
