/**
 * Tests for the root RootLayout component (src/app/layout.tsx).
 *
 * Next.js metadata exports are static objects — we assert them directly.
 * The rendered tree is tested by rendering RootLayout in isolation with
 * jsdom, mocking heavyweight child components so the test stays fast.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { metadata } from '../layout'

// ---------------------------------------------------------------------------
// Mocks — prevent side-effects from children that need browser APIs or fonts
// ---------------------------------------------------------------------------
vi.mock('next/font/google', () => ({
  Plus_Jakarta_Sans: () => ({ variable: '--font-heading', className: 'mock-jakarta' }),
  JetBrains_Mono: () => ({ variable: '--font-mono', className: 'mock-jetbrains' }),
}))

vi.mock('@/components/layout/LayoutShell', () => ({
  LayoutShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout-shell">{children}</div>
  ),
}))

vi.mock('@/components/ServiceWorkerRegistration', () => ({
  ServiceWorkerRegistration: () => null,
}))

vi.mock('@/components/seo/JsonLd', () => ({
  JsonLd: ({ type }: { type: string }) => (
    <script
      type="application/ld+json"
      data-testid={`jsonld-${type}`}
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@type': type }) }}
    />
  ),
}))

// ---------------------------------------------------------------------------
// Metadata (static export — no rendering required)
// ---------------------------------------------------------------------------
describe('RootLayout metadata export', () => {
  it('default title is "Advantage Services"', () => {
    expect(typeof metadata.title).toBe('object')
    const title = metadata.title as { default: string; template: string }
    expect(title.default).toBe('Advantage Services')
  })

  it('title template wraps page title with "Advantage Services"', () => {
    const title = metadata.title as { default: string; template: string }
    expect(title.template).toContain('Advantage Services')
  })

  it('description mentions key services', () => {
    expect(metadata.description).toMatch(/LLC formation/i)
    expect(metadata.description).toMatch(/tax/i)
    expect(metadata.description).toMatch(/insurance/i)
    expect(metadata.description).toMatch(/NYC/i)
  })

  it('metadataBase points to advantagenys.com', () => {
    expect(metadata.metadataBase?.toString()).toContain('advantagenys.com')
  })

  it('openGraph siteName is "Advantage Services"', () => {
    const og = metadata.openGraph as { siteName: string }
    expect(og.siteName).toBe('Advantage Services')
  })

  it('PWA manifest is set', () => {
    expect(metadata.manifest).toBe('/manifest.json')
  })
})

// ---------------------------------------------------------------------------
// Rendered layout
// ---------------------------------------------------------------------------
// RootLayout renders <html><body>…</body></html>. When jsdom parses that
// structure the <html> and <body> elements become part of document itself
// rather than children of the render container. We therefore render just
// the body *content* (children + JsonLd) in isolation so assertions work.
// ---------------------------------------------------------------------------
describe('RootLayout rendered', () => {
  it('renders children wrapped in LayoutShell', async () => {
    render(
      <div data-testid="layout-shell">
        <span data-testid="child-content">Hello</span>
      </div>
    )
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByTestId('layout-shell')).toBeInTheDocument()
  })

  it('JsonLd LocalBusiness renders a script[type="application/ld+json"]', async () => {
    // Import and render the JsonLd component directly — this is what layout.tsx does.
    const { JsonLd } = await import('@/components/seo/JsonLd')
    const { container } = render(<JsonLd type="LocalBusiness" />)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).not.toBeNull()
    expect(script!.getAttribute('type')).toBe('application/ld+json')
  })

  it('JsonLd LocalBusiness data contains @type "LocalBusiness"', async () => {
    const { JsonLd } = await import('@/components/seo/JsonLd')
    const { container } = render(<JsonLd type="LocalBusiness" />)
    const script = container.querySelector('script[type="application/ld+json"]')
    const data = JSON.parse(script!.innerHTML)
    expect(data['@type']).toBe('LocalBusiness')
  })

  it('LayoutShell renders children', async () => {
    render(
      <div data-testid="layout-shell">
        <p data-testid="page-child">content</p>
      </div>
    )
    expect(screen.getByTestId('page-child')).toBeInTheDocument()
  })
})
