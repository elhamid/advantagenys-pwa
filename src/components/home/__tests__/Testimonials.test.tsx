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
    expect(screen.getAllByText(/restaurant owner/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/general contractor/i).length).toBeGreaterThan(0)

    const secondDot = screen.getByRole('button', { name: /go to testimonial 2/i })
    fireEvent.click(secondDot)

    expect(secondDot).toHaveStyle({ transform: 'scale(1.3)' })
  })
})
