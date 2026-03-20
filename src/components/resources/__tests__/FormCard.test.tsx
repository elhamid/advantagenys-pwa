import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FormCard } from '../FormCard'
import type { FormConfig } from '@/lib/forms'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    button: ({ children, ...props }: { children: React.ReactNode }) => (
      <button type="button" {...props}>
        {children}
      </button>
    ),
    svg: ({ children }: { children: React.ReactNode }) => <svg>{children}</svg>,
    span: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

const baseForm: FormConfig = {
  id: 'native-test',
  title: 'Test Intake',
  description: 'Test description',
  category: 'business',
  platform: 'native',
  active: true,
  priority: 1,
  slug: 'test-intake',
}

describe('FormCard', () => {
  it('renders native forms with the internal route and share controls', () => {
    render(<FormCard form={baseForm} />)

    expect(screen.getByText('Test Intake')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute(
      'href',
      '/resources/forms/test-intake',
    )
    expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Share Test Intake' })).toBeInTheDocument()
  })

  it('renders link forms as external links and shows encryption state', () => {
    render(
      <FormCard
        form={{
          ...baseForm,
          type: 'link',
          title: 'Office Address',
          encrypted: true,
          linkUrl: 'https://maps.google.com/',
          slug: 'office-address',
        }}
        kioskMode
      />,
    )

    expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute(
      'href',
      'https://maps.google.com/',
    )
  })
})
