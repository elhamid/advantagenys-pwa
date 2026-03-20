import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { QuickPathsSection } from '../QuickPathsSection'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/components/ui/Container', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('QuickPathsSection', () => {
  it('renders quick path cards and call-to-action links', () => {
    const { container } = render(<QuickPathsSection />)

    expect(container.textContent).toContain('Start Where You Are')
    expect(container.querySelector('a[href="/industries/contractors/"]')).toBeTruthy()
    expect(container.querySelector('a[href="/services/business-formation/"]')).toBeTruthy()
    expect(container.querySelector('a[href="/services"]')).toBeTruthy()
    expect(container.querySelector('a[href="https://wa.me/19299331396"]')).toBeTruthy()
    expect(container.querySelector('a[href="tel:+19299331396"]')).toBeTruthy()
  })
})
