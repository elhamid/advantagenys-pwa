import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Skeleton } from '../Skeleton'

describe('Skeleton', () => {
  it('renders an aria-hidden skeleton with the default rounding', () => {
    const { container } = render(<Skeleton className="h-4 w-24" />)

    const node = container.firstElementChild as HTMLElement
    expect(node).toHaveAttribute('aria-hidden', 'true')
    expect(node.className).toContain('rounded-md')
  })

  it('supports alternate rounding styles', () => {
    const { container } = render(<Skeleton className="h-4 w-24" rounded="full" />)

    expect(container.firstElementChild).toHaveClass('rounded-full')
  })
})
