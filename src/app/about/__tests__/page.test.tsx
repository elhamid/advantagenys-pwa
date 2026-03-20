/**
 * Tests for the About page (src/app/about/page.tsx).
 *
 * Covers: all 6 team members rendered, photos present, names + roles visible,
 * page heading contains "About", and the static metadata export.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// next/image → plain <img> so jsdom can assert src/alt
vi.mock('next/image', () => ({
  default: ({ src, alt, ...rest }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-testid="team-photo" {...rest} />
  ),
}))

// ui components — pass-through wrappers
vi.mock('@/components/ui/Container', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/Card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
import { TEAM } from '@/lib/constants'
import AboutPage, { metadata } from '../page'

// ---------------------------------------------------------------------------
// Metadata (static export)
// ---------------------------------------------------------------------------
describe('About page metadata', () => {
  it('title is "About Us"', () => {
    expect(metadata.title).toBe('About Us')
  })

  it('description mentions Advantage Services', () => {
    expect(metadata.description).toMatch(/Advantage Services/i)
  })

  it('description mentions NYC', () => {
    expect(metadata.description).toMatch(/NYC/i)
  })
})

// ---------------------------------------------------------------------------
// Rendered page
// ---------------------------------------------------------------------------
describe('AboutPage rendered', () => {
  beforeEach(() => {
    render(<AboutPage />)
  })

  it('renders a heading that contains "About"', () => {
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toMatch(/about/i)
  })

  it(`renders all ${TEAM.length} team members`, () => {
    // Each member has an h3 with their full name
    for (const member of TEAM) {
      expect(screen.getByText(member.fullName)).toBeInTheDocument()
    }
  })

  it('renders a photo (img) for each team member', () => {
    const photos = screen.getAllByTestId('team-photo')
    expect(photos.length).toBeGreaterThanOrEqual(TEAM.length)
  })

  it('every team photo has a non-empty alt text', () => {
    const photos = screen.getAllByTestId('team-photo')
    for (const photo of photos) {
      expect(photo.getAttribute('alt')).toBeTruthy()
    }
  })

  it('renders the role for each team member', () => {
    for (const member of TEAM) {
      // Multiple members can share the same role string (e.g. "Consultant"),
      // so use getAllByText and assert at least one match exists.
      const matches = screen.getAllByText(member.role)
      expect(matches.length).toBeGreaterThan(0)
    }
  })

  it('renders a "Our Team" section heading', () => {
    expect(
      screen.getByRole('heading', { name: /our team/i })
    ).toBeInTheDocument()
  })

  // Spot-check two specific members
  it('shows Jay Agrawal with his role', () => {
    expect(screen.getByText('Sanjay (Jay) Agrawal')).toBeInTheDocument()
    expect(screen.getByText(/President, Licensed Insurance Broker/i)).toBeInTheDocument()
  })

  it('shows Hamid Elsevar with his role', () => {
    expect(screen.getByText('Hamid Elsevar')).toBeInTheDocument()
    expect(screen.getByText(/Growth Operator/i)).toBeInTheDocument()
  })

  it('renders specialty tags for each member', () => {
    // Every member has at least one specialty — spot-check a few
    expect(screen.getAllByText('Tax').length).toBeGreaterThan(0)
    expect(screen.getByText('ITIN')).toBeInTheDocument()
  })
})
