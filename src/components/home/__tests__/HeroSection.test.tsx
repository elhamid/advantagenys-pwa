import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { HeroSection } from '../HeroSection'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: () => ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    },
  ),
  useReducedMotion: () => true,
  useScroll: () => ({ scrollYProgress: {} }),
  useTransform: () => undefined,
}))

describe('HeroSection', () => {
  it('renders the hero heading, background image, and contact links', () => {
    render(<HeroSection />)

    expect(screen.getByText(/advantage services/i)).toBeInTheDocument()
    expect(screen.getByText(/we handle the business/i)).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /advantage services office in cambria heights/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /whatsapp/i })).toHaveAttribute(
      'href',
      'https://wa.me/19299331396',
    )
    expect(screen.getByRole('link', { name: /call/i })).toHaveAttribute('href', 'tel:+19299331396')
  })
})
