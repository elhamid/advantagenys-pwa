import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { StatsSection } from '../StatsSection'

class MockIntersectionObserver {
  constructor(private callback: IntersectionObserverCallback) {}
  observe = () => {
    this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
  }
  disconnect = () => {}
  unobserve = () => {}
  takeRecords = () => []
}

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
  useInView: () => true,
}))

beforeEach(() => {
  vi.spyOn(performance, 'now').mockReturnValue(0)
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(1800)
    return 1
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('StatsSection', () => {
  it('counts up the key metrics and links to Google reviews', async () => {
    render(<StatsSection />)

    expect(screen.getByText('1700+')).toBeInTheDocument()
    expect(screen.getByText('5700+')).toBeInTheDocument()
    expect(screen.getByText('2500+')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /google \(27 reviews\)/i })).toHaveAttribute(
      'href',
      'https://www.google.com/maps/place/Advantage+Business+Consulting+LLC/@40.692388,-73.7344482,1117m',
    )
  })
})
