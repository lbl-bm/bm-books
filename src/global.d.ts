import type { AstroIntegration } from '@swup/astro'
import type { SearchClient } from './types/search'

declare global {
  interface Window {
    pagefind?: SearchClient
    pagefindReady?: Promise<SearchClient>
    // type from '@swup/astro' is incorrect
    swup: AstroIntegration
  }
}
