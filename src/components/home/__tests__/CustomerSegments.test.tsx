import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CustomerSegments } from '../CustomerSegments'

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

describe('CustomerSegments', () => {
  it('renders the industry segments and links', () => {
    render(<CustomerSegments />)

    expect(screen.getByText(/built for your industry/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contractors/i })).toHaveAttribute(
      'href',
      '/industries/contractors/',
    )
    expect(screen.getByRole('link', { name: /restaurants/i })).toHaveAttribute(
      'href',
      '/industries/restaurants/',
    )
    expect(screen.getByRole('link', { name: /immigrant entrepreneurs/i })).toHaveAttribute(
      'href',
      '/industries/immigrant-entrepreneurs/',
    )
  })
})
