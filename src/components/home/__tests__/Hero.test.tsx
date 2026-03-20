import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Hero } from '../Hero'

vi.mock('@/components/ui/Container', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/Button', () => ({
  Button: ({ href, children }: { href?: string; children: React.ReactNode }) =>
    href ? <a href={href}>{children}</a> : <button type="button">{children}</button>,
}))

vi.mock('@/components/ui/Badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: () => ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    },
  ),
}))

describe('Hero', () => {
  it('renders the hero copy and primary calls to action', () => {
    const { container } = render(<Hero />)

    expect(screen.getByText(/irs certified acceptance agent/i)).toBeInTheDocument()
    expect(container.textContent).toContain('Your Business.')
    expect(container.textContent).toContain('Our Expertise.')
    expect(container.textContent).toContain('Real Relationships.')
    expect(screen.getByRole('link', { name: /talk to a specialist/i })).toHaveAttribute(
      'href',
      '/contact',
    )
    expect(screen.getByRole('link', { name: /browse services/i })).toHaveAttribute(
      'href',
      '/services',
    )
    expect(container.textContent).toContain('4.8/5')
    expect(container.textContent).toContain('from 150+ clients')
  })
})
