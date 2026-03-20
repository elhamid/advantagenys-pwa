import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { categoryIcons } from '../categoryIcons'

describe('categoryIcons', () => {
  it('exports an icon component for each category', () => {
    const { container } = render(
      <div>
        {Object.entries(categoryIcons).map(([key, Icon]) => (
          <Icon key={key} />
        ))}
      </div>,
    )

    expect(Object.keys(categoryIcons)).toEqual([
      'tax',
      'immigration',
      'business',
      'insurance',
      'licensing',
      'financial',
      'other',
    ])
    expect(container.querySelectorAll('svg').length).toBe(7)
  })
})
