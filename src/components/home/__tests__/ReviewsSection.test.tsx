import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ReviewsSection } from '../ReviewsSection'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
  useInView: () => true,
  useReducedMotion: () => false,
}))

describe('ReviewsSection', () => {
  it('renders review cards and the Google rating link', () => {
    const { container } = render(<ReviewsSection />)

    expect(container.textContent).toContain("Don't take our word for it.")
    expect(screen.getByText(/brandon diodati/i)).toBeInTheDocument()
    expect(screen.getByText(/delacia p\./i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /4\.9 out of 5/i })).toHaveAttribute(
      'href',
      'https://www.google.com/maps/place/Advantage+Business+Consulting+LLC/@40.692388,-73.7344482,1117m',
    )
  })
})
