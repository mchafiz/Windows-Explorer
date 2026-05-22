import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { useSearch } from '../../../src/composables/useSearch'

vi.mock('../../../src/services/folderService', () => ({
  folderService: {
    search: vi.fn().mockResolvedValue({
      folders: [{ id: '1', name: 'Holiday', parentId: null, createdAt: '' }],
      files: [],
      meta: { query: 'holiday', total: 1 },
    }),
  },
}))

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
})

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})

describe('useSearch', () => {
  it('results are null initially', () => {
    const { results } = useSearch()
    expect(results.value).toBeNull()
  })

  it('clears results when query is empty', async () => {
    const { query, results } = useSearch()
    query.value = 'test'
    vi.runAllTimers()
    await nextTick()
    query.value = ''
    await nextTick()
    expect(results.value).toBeNull()
  })

  it('debounces — does not call API immediately', async () => {
    const { folderService } = await import('../../../src/services/folderService')
    const { query } = useSearch()
    query.value = 'hol'
    await nextTick()
    expect(folderService.search).not.toHaveBeenCalled()
  })

  it('calls API after 300ms debounce', async () => {
    const { folderService } = await import('../../../src/services/folderService')
    const { query } = useSearch()
    query.value = 'holiday'
    await nextTick()
    await vi.runAllTimersAsync()
    expect(folderService.search).toHaveBeenCalledWith('holiday')
  })

  it('clear() resets query and results', async () => {
    const { query, results, clear } = useSearch()
    query.value = 'test'
    vi.runAllTimers()
    await nextTick()
    clear()
    expect(query.value).toBe('')
    expect(results.value).toBeNull()
  })
})
