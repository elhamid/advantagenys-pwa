import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PageSkeleton } from '../PageSkeleton'

describe('PageSkeleton', () => {
  it('renders a loading shell with busy state', () => {
    render(<PageSkeleton />)

    expect(screen.getByLabelText(/loading page/i)).toHaveAttribute('aria-busy', 'true')
    expect(screen.getAllByRole('generic').length).toBeGreaterThan(1)
  })
})
