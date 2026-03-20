import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TeamSection } from '../TeamSection'
import { TEAM } from '@/lib/constants'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
  useInView: () => true,
  useScroll: () => ({ scrollYProgress: {} }),
  useTransform: () => undefined,
}))

describe('TeamSection', () => {
  it('renders the team roster and supporting imagery', () => {
    render(<TeamSection />)

    expect(screen.getByText(/the people behind the promise/i)).toBeInTheDocument()
    for (const member of TEAM) {
      expect(screen.getByText(member.fullName)).toBeInTheDocument()
    }
    expect(
      screen.getByRole('img', { name: /the advantage services team/i }),
    ).toBeInTheDocument()
  })
})
