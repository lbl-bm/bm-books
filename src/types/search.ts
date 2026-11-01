export interface SearchDocument {
  url: string
  meta: { title: string }
  excerpt: string
}

export interface SearchHit {
  data(): Promise<SearchDocument>
}

export interface SearchClient {
  search(query: string): Promise<{ results: SearchHit[] }>
}

export interface SearchState {
  status: 'idle' | 'loading' | 'ready' | 'empty' | 'error'
  query: string
  results: SearchDocument[]
}

export interface SearchController {
  search(query: string): void
  dispose(): void
}
