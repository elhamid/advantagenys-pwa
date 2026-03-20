/**
 * Tests for src/lib/chat/get-faqs.ts — getServiceFAQs()
 *
 * getFAQsByService is mocked in every test so no Supabase client is created.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { KnowledgeEntry } from '@/lib/chat/knowledge'

// ---------------------------------------------------------------------------
// Mock the dependency before importing the module under test
// ---------------------------------------------------------------------------
vi.mock('@/lib/chat/knowledge', () => ({
  getFAQsByService: vi.fn(),
}))

import { getServiceFAQs } from '../get-faqs'
import { getFAQsByService } from '@/lib/chat/knowledge'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeEntry(overrides: Partial<KnowledgeEntry> = {}): KnowledgeEntry {
  return {
    id: 'entry-1',
    title: 'What is an ITIN?',
    content: 'An Individual Taxpayer Identification Number issued by the IRS.',
    category: 'faq',
    keywords: ['itin', 'tax id'],
    service_slug: 'tax',
    is_active: true,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('getServiceFAQs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // -------------------------------------------------------------------------
  // Mapping
  // -------------------------------------------------------------------------
  it('maps entry.title → question and entry.content → answer', async () => {
    vi.mocked(getFAQsByService).mockResolvedValue([makeEntry()])

    const result = await getServiceFAQs('tax')

    expect(result).toHaveLength(1)
    expect(result[0].question).toBe('What is an ITIN?')
    expect(result[0].answer).toBe(
      'An Individual Taxpayer Identification Number issued by the IRS.'
    )
  })

  it('maps multiple entries preserving order', async () => {
    const entries: KnowledgeEntry[] = [
      makeEntry({ id: '1', title: 'Q1', content: 'A1' }),
      makeEntry({ id: '2', title: 'Q2', content: 'A2' }),
      makeEntry({ id: '3', title: 'Q3', content: 'A3' }),
    ]
    vi.mocked(getFAQsByService).mockResolvedValue(entries)

    const result = await getServiceFAQs('tax')

    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ question: 'Q1', answer: 'A1' })
    expect(result[1]).toEqual({ question: 'Q2', answer: 'A2' })
    expect(result[2]).toEqual({ question: 'Q3', answer: 'A3' })
  })

  it('passes the serviceSlug argument through to getFAQsByService', async () => {
    vi.mocked(getFAQsByService).mockResolvedValue([])

    await getServiceFAQs('insurance')

    expect(getFAQsByService).toHaveBeenCalledWith('insurance')
  })

  // -------------------------------------------------------------------------
  // Empty results
  // -------------------------------------------------------------------------
  it('returns empty array when getFAQsByService returns no entries', async () => {
    vi.mocked(getFAQsByService).mockResolvedValue([])

    const result = await getServiceFAQs('tax')

    expect(result).toEqual([])
    expect(Array.isArray(result)).toBe(true)
  })

  // -------------------------------------------------------------------------
  // Error handling
  // -------------------------------------------------------------------------
  it('returns empty array when getFAQsByService throws', async () => {
    vi.mocked(getFAQsByService).mockRejectedValue(new Error('Supabase connection failed'))

    const result = await getServiceFAQs('tax')

    expect(result).toEqual([])
  })

  it('logs an error when getFAQsByService throws', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(getFAQsByService).mockRejectedValue(new Error('DB error'))

    await getServiceFAQs('tax')

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('tax'),
      expect.any(Error)
    )
    errorSpy.mockRestore()
  })

  it('does not throw when getFAQsByService rejects — always resolves', async () => {
    vi.mocked(getFAQsByService).mockRejectedValue(new Error('Network timeout'))

    await expect(getServiceFAQs('tax')).resolves.toEqual([])
  })

  // -------------------------------------------------------------------------
  // Result shape
  // -------------------------------------------------------------------------
  it('each result item has only "question" and "answer" keys', async () => {
    vi.mocked(getFAQsByService).mockResolvedValue([
      makeEntry({ id: 'x', title: 'Q?', content: 'A.' }),
    ])

    const result = await getServiceFAQs('tax')

    expect(Object.keys(result[0]).sort()).toEqual(['answer', 'question'])
  })
})
