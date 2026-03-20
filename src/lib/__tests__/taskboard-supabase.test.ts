/**
 * Tests for src/lib/taskboard-supabase.ts
 *
 * The module uses process.env at import time, so each scenario requires
 * resetting modules and re-importing with the desired env state.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock @supabase/supabase-js so no real network calls are made
// ---------------------------------------------------------------------------
const mockClient = { from: vi.fn() }

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockClient),
}))

describe('taskboardSupabase', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    // Restore env after each test
    process.env.TASKBOARD_SUPABASE_URL = originalEnv.TASKBOARD_SUPABASE_URL
    process.env.TASKBOARD_SUPABASE_ANON_KEY = originalEnv.TASKBOARD_SUPABASE_ANON_KEY
    vi.resetModules()
  })

  // -------------------------------------------------------------------------
  // Missing env vars → client is null
  // -------------------------------------------------------------------------
  describe('when env vars are missing', () => {
    beforeEach(() => {
      delete process.env.TASKBOARD_SUPABASE_URL
      delete process.env.TASKBOARD_SUPABASE_ANON_KEY
      vi.resetModules()
    })

    it('exports null when both env vars are absent', async () => {
      const { taskboardSupabase } = await import('../taskboard-supabase')
      expect(taskboardSupabase).toBeNull()
    })

    it('exports null when only URL is set', async () => {
      process.env.TASKBOARD_SUPABASE_URL = 'https://test.supabase.co'
      delete process.env.TASKBOARD_SUPABASE_ANON_KEY
      vi.resetModules()

      const { taskboardSupabase } = await import('../taskboard-supabase')
      expect(taskboardSupabase).toBeNull()
    })

    it('exports null when only anon key is set', async () => {
      delete process.env.TASKBOARD_SUPABASE_URL
      process.env.TASKBOARD_SUPABASE_ANON_KEY = 'test-anon-key'
      vi.resetModules()

      const { taskboardSupabase } = await import('../taskboard-supabase')
      expect(taskboardSupabase).toBeNull()
    })

    it('logs a warning when env vars are missing', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      await import('../taskboard-supabase')
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing TASKBOARD_SUPABASE_URL')
      )
      warnSpy.mockRestore()
    })
  })

  // -------------------------------------------------------------------------
  // Both env vars present → client is created
  // -------------------------------------------------------------------------
  describe('when both env vars are present', () => {
    const TEST_URL = 'https://test-project.supabase.co'
    const TEST_KEY = 'test-anon-key-abc123'

    beforeEach(() => {
      process.env.TASKBOARD_SUPABASE_URL = TEST_URL
      process.env.TASKBOARD_SUPABASE_ANON_KEY = TEST_KEY
      vi.resetModules()
    })

    it('exports a non-null client', async () => {
      const { taskboardSupabase } = await import('../taskboard-supabase')
      expect(taskboardSupabase).not.toBeNull()
    })

    it('calls createClient with the correct URL and key', async () => {
      const { createClient } = await import('@supabase/supabase-js')
      await import('../taskboard-supabase')
      expect(createClient).toHaveBeenCalledWith(TEST_URL, TEST_KEY)
    })

    it('the exported client is the object returned by createClient', async () => {
      const { taskboardSupabase } = await import('../taskboard-supabase')
      expect(taskboardSupabase).toBe(mockClient)
    })
  })
})
