import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FinalCTA } from '../FinalCTA'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    h2: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
    p: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
    blockquote: ({ children }: { children: React.ReactNode }) => <blockquote>{children}</blockquote>,
  },
  useInView: () => true,
}))

describe('FinalCTA', () => {
  it('renders the closing CTA and contact details', () => {
    render(<FinalCTA />)

    expect(screen.getByRole('heading', { name: /one conversation could/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /call/i })).toHaveAttribute('href', 'tel:+19299331396')
    expect(screen.getByRole('link', { name: /whatsapp/i })).toHaveAttribute(
      'href',
      'https://wa.me/19299331396',
    )
    expect(screen.getByText(/monday - saturday/i)).toBeInTheDocument()
    expect(screen.getByText(/cambria heights, ny 11411/i)).toBeInTheDocument()
  })
})
