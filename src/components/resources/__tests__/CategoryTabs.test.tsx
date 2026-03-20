import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CategoryTabs } from '../CategoryTabs'

vi.mock('@/components/ui/Card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/ScrollReveal', () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('CategoryTabs', () => {
  it('shows category buttons and filters forms by category', () => {
    render(<CategoryTabs />)

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tax Services' })).toBeInTheDocument()
    expect(screen.getByText('ITIN Registration Form')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Tax Services' }))

    expect(screen.getByText('Tax Return Questionnaire')).toBeInTheDocument()
    expect(screen.queryByText('BOIR Form')).not.toBeInTheDocument()
  })
})
