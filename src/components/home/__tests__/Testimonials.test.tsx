import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Testimonials } from '../Testimonials'

vi.mock('@/components/ui/Container', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/Card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('Testimonials', () => {
  it('renders testimonial cards and updates the active mobile dot', () => {
    render(<Testimonials />)

    expect(screen.getByText(/trusted by nyc businesses/i)).toBeInTheDocument()
    // Updated 2026-04-22: moved from unattributed quotes to real Google reviews
    // (Palmyre Seraphin, Delacia P., Oshane Hinds) for ads-compliance.
    expect(screen.getAllByText(/palmyre seraphin/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/oshane hinds/i).length).toBeGreaterThan(0)

    const secondDot = screen.getByRole('button', { name: /go to testimonial 2/i })
    fireEvent.click(secondDot)

    expect(secondDot).toHaveStyle({ transform: 'scale(1.3)' })
  })
})
