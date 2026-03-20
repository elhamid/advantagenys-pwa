import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PersonaCarousel } from '../PersonaCarousel'

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
  useInView: () => true,
}))

beforeEach(() => {
  vi.stubGlobal('setInterval', vi.fn(() => 1))
  vi.stubGlobal('clearInterval', vi.fn())
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('PersonaCarousel', () => {
  it('renders representative persona panels and CTAs', () => {
    const { container } = render(<PersonaCarousel />)

    expect(container.textContent).toContain('THE CONTRACTOR')
    expect(container.textContent).toContain('THE RESTAURANT OWNER')
    expect(container.textContent).toContain('THE FULL-SERVICE CLIENT')
    expect(container.querySelector('img[alt="Contractor at a Brooklyn renovation site"]')).toBeTruthy()
    expect(container.querySelector('a[href="/industries/contractors"]')).toBeTruthy()
    expect(container.querySelector('a[href="/contact"]')).toBeTruthy()
    expect(container.textContent).toContain('I just want to build. Not fight with paperwork.')
  })
})
