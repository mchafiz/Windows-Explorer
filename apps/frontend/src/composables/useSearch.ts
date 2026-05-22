import { ref, watch } from 'vue'
import { folderService } from '../services/folderService'
import type { SearchResultData } from '../types/folder'

const DEBOUNCE_MS = 300

export function useSearch() {
  const query       = ref('')
  const results     = ref<SearchResultData | null>(null)
  const searching   = ref(false)
  const searchError = ref<string | null>(null)

  let timer: ReturnType<typeof setTimeout> | null = null

  watch(query, (val) => {
    if (timer) clearTimeout(timer)

    if (!val.trim()) {
      results.value = null
      return
    }

    timer = setTimeout(async () => {
      searching.value = true
      searchError.value = null
      try {
        results.value = await folderService.search(val.trim())
      } catch (e) {
        searchError.value = e instanceof Error ? e.message : 'Search failed'
      } finally {
        searching.value = false
      }
    }, DEBOUNCE_MS)
  })

  function clear() {
    if (timer) clearTimeout(timer)
    query.value   = ''
    results.value = null
  }

  return { query, results, searching, searchError, clear }
}
