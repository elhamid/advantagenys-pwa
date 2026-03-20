import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { JourneyTimeline } from '../JourneyTimeline'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
  useInView: () => true,
}))

describe('JourneyTimeline', () => {
  it('renders the timeline steps', () => {
    render(<JourneyTimeline />)

    expect(screen.getByText(/one firm\. start to finish\./i)).toBeInTheDocument()
    expect(screen.getAllByText('Form Your Business').length).toBeGreaterThan(1)
    expect(screen.getAllByText('Get Licensed').length).toBeGreaterThan(1)
    expect(screen.getAllByText('Grow').length).toBeGreaterThan(1)
  })
})
