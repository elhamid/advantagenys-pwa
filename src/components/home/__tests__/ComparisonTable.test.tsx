import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ComparisonTable } from '../ComparisonTable'

vi.mock('@/components/ui/Container', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/ScrollReveal', () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('ComparisonTable', () => {
  it('renders the comparison table and key features', () => {
    render(<ComparisonTable />)

    expect(screen.getByText(/why advantage services/i)).toBeInTheDocument()
    expect(screen.getByText('Business Formation')).toBeInTheDocument()
    expect(screen.getByText('Small Business Pricing')).toBeInTheDocument()
    expect(screen.getByText('Advantage Services')).toBeInTheDocument()
  })
})
