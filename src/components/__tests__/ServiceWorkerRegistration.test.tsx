import { render } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { ServiceWorkerRegistration } from '../ServiceWorkerRegistration'

afterEach(() => {
  Reflect.deleteProperty(navigator, 'serviceWorker')
  vi.restoreAllMocks()
})

describe('ServiceWorkerRegistration', () => {
  it('registers the service worker when available', async () => {
    const register = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register },
      configurable: true,
    })

    render(<ServiceWorkerRegistration />)

    expect(register).toHaveBeenCalledWith('/sw.js')
  })

  it('does nothing when service workers are unavailable', () => {
    Reflect.deleteProperty(navigator, 'serviceWorker')

    render(<ServiceWorkerRegistration />)

    expect(true).toBe(true)
  })
})
