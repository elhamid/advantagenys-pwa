import '@testing-library/jest-dom'

// Mock sessionStorage if not available
if (typeof window !== 'undefined' && !window.sessionStorage) {
  const sessionStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value },
      removeItem: (key: string) => { delete store[key] },
      clear: () => { store = {} },
      get length() { return Object.keys(store).length },
      key: (index: number) => Object.keys(store)[index] ?? null,
    }
  })()
  Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })
}

// Mock Turnstile widget
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'turnstile', {
    value: {
      render: (_el: unknown, opts: { callback?: (token: string) => void }) => {
        opts?.callback?.('test-token')
        return 'mock-widget-id'
      },
      reset: () => {},
      remove: () => {},
    },
    writable: true,
  })
}

// Environment variables for tests
process.env.TURNSTILE_SECRET_KEY = 'test-secret'
process.env.TASKBOARD_WEBHOOK_URL = 'https://test-webhook.example.com'
