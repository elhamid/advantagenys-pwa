import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TrustSignals } from '../TrustSignals'

vi.mock('@/hooks/useCountUp', () => ({
  useCountUp: (target: number) => ({ ref: vi.fn(), count: target }),
}))

describe('TrustSignals', () => {
  it('renders the trust metrics', () => {
    render(<TrustSignals />)

    expect(screen.getByText('20+')).toBeInTheDocument()
    expect(screen.getByText('2,250+')).toBeInTheDocument()
    expect(screen.getByText(/irs certified/i)).toBeInTheDocument()
    expect(screen.getByText(/licensed/i)).toBeInTheDocument()
  })
})
