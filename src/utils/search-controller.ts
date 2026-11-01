import type { SearchClient, SearchController, SearchState } from '../types/search.ts'

export function createSearchController(
  load: () => Promise<SearchClient>,
  onChange: (state: SearchState) => void,
  delay = 180,
): SearchController {
  let revision = 0
  let disposed = false
  let timer: ReturnType<typeof setTimeout> | undefined

  return {
    search(rawQuery: string): void {
      const query = rawQuery.trim()
      const current = ++revision
      clearTimeout(timer)
      if (disposed) return
      if (!query) {
        onChange({ status: 'idle', query, results: [] })
        return
      }
      onChange({ status: 'loading', query, results: [] })
      timer = setTimeout(async () => {
        try {
          const api = await load()
          const response = await api.search(query)
          const results = await Promise.all(response.results.map(hit => hit.data()))
          if (disposed || current !== revision) return
          onChange({ status: results.length ? 'ready' : 'empty', query, results })
        } catch {
          if (disposed || current !== revision) return
          onChange({ status: 'error', query, results: [] })
        }
      }, delay)
    },
    dispose(): void {
      disposed = true
      revision++
      clearTimeout(timer)
    },
  }
}
