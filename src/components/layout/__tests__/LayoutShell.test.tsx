import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { LayoutShell } from '../LayoutShell'

const pathname = vi.hoisted(() => ({ value: '/' }))

vi.mock('next/navigation', () => ({
  usePathname: () => pathname.value,
}))

vi.mock('../Header', () => ({
  Header: ({ mobileNavOpen }: { mobileNavOpen: boolean }) => (
    <header>{mobileNavOpen ? 'Header open' : 'Header closed'}</header>
  ),
}))

vi.mock('../Footer', () => ({
  Footer: () => <footer>Footer</footer>,
}))

vi.mock('../BottomNav', () => ({
  BottomNav: ({ onOpenMore }: { onOpenMore: () => void }) => (
    <button type="button" onClick={onOpenMore}>
      More
    </button>
  ),
}))

vi.mock('@/components/chat/ChatWidget', () => ({
  ChatWidget: () => <div>ChatWidget</div>,
}))

afterEach(() => {
  pathname.value = '/'
  vi.restoreAllMocks()
})

describe('LayoutShell', () => {
  it('renders the site chrome on normal routes and opens mobile nav from BottomNav', () => {
    pathname.value = '/'

    render(
      <LayoutShell>
        <main>Page</main>
      </LayoutShell>,
    )

    expect(screen.getByText('Header closed')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
    expect(screen.getByText('ChatWidget')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'More' }))

    expect(screen.getByText('Header open')).toBeInTheDocument()
  })

  it('hides chrome on kiosk routes', () => {
    pathname.value = '/resources/kiosk/forms'

    render(
      <LayoutShell>
        <main>Page</main>
      </LayoutShell>,
    )

    expect(screen.queryByText('Header closed')).not.toBeInTheDocument()
    expect(screen.queryByText('Footer')).not.toBeInTheDocument()
    expect(screen.queryByText('ChatWidget')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'More' })).not.toBeInTheDocument()
  })
})
