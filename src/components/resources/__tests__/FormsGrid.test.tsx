import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FormsGrid } from '../FormsGrid'

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target: unknown, tag: string) => {
        const Component = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
          const { initial, animate, exit, transition, style, ...rest } = props
          void initial; void animate; void exit; void transition
          return React.createElement(tag, { ...rest, style }, children)
        }
        return Component
      },
    },
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('../FormCard', () => ({
  FormCard: ({ form }: { form: { title: string } }) => <div>{form.title}</div>,
}))

describe('FormsGrid', () => {
  it('filters forms by category and search term', () => {
    render(<FormsGrid />)

    expect(screen.getByText(/items/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tax Services' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Tax Services' }))
    expect(screen.getByText('Tax Return Questionnaire')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText(/search forms & links/i), {
      target: { value: 'questionnaire' },
    })

    expect(screen.getByText(/matching "questionnaire"/i)).toBeInTheDocument()
    expect(screen.getByText('Tax Return Questionnaire')).toBeInTheDocument()
    expect(screen.queryByText('ITIN Registration Form')).not.toBeInTheDocument()
  })

  it('clears filters when the clear button is used', () => {
    const { container } = render(<FormsGrid kioskMode />)

    fireEvent.change(screen.getByPlaceholderText(/search forms & links/i), {
      target: { value: 'tax' },
    })

    const clearButton = screen
      .getAllByRole('button')
      .find((button) => !button.textContent?.trim())
    expect(clearButton).toBeDefined()
    fireEvent.click(clearButton!)

    // 18 active entries (5 retired: Divorce, Sales Tax, Bookkeeping, New I-130 pair)
    expect(screen.getByText(/18 items/i)).toBeInTheDocument()
    expect(screen.queryByText(/matching/i)).not.toBeInTheDocument()
    expect(container).toBeTruthy()
  })
})
