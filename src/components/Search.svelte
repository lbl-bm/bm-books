<script lang="ts">
import { onMount } from 'svelte'
import Icon from '@iconify/svelte'
import { i18n } from '@i18n/translation'
import I18nKey from '@i18n/i18nKey'
import { url } from '@utils/url-utils'
import { setPanelOpen, togglePanel } from '@utils/panel-utils'
import { createSearchController } from '@utils/search-controller'
import type { SearchController, SearchDocument, SearchState } from '../types/search'

let keyword = ''
let state: SearchState = { status: 'idle', query: '', results: [] }
let controller: SearchController | undefined
const examples: SearchDocument[] = [{
  url: url('/archive/'),
  meta: { title: '开发模式搜索演示' },
  excerpt: '完整搜索需要先运行生产构建，再通过 preview 预览。',
}]

onMount(() => {
  controller = createSearchController(async () => {
    if (!import.meta.env.PROD) {
      return { search: async () => ({ results: examples.map(item => ({ data: async () => item })) }) }
    }
    if (!window.pagefindReady) throw new Error('Search index is unavailable')
    return await window.pagefindReady
  }, next => { state = next })
  return () => controller?.dispose()
})

$: controller?.search(keyword)
const openSearch = () => setPanelOpen('search-panel', true)
</script>

<div role="search" aria-label="站内搜索" id="search-bar" class="hidden lg:flex transition-all items-center h-11 mr-2 rounded-lg bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06] dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10">
  <Icon icon="material-symbols:search" aria-hidden="true" class="absolute text-[1.25rem] pointer-events-none ml-3 text-black/30 dark:text-white/30" />
  <input type="search" aria-label={i18n(I18nKey.search)} aria-controls="search-panel" placeholder={i18n(I18nKey.search)} bind:value={keyword} on:focus={openSearch} on:input={openSearch} class="transition-all pl-10 pr-3 text-sm bg-transparent outline-0 h-full w-40 focus:w-60 text-black/75 dark:text-white/75" />
</div>

<button type="button" on:click={() => togglePanel('search-panel', true)} aria-label="打开搜索" aria-controls="search-panel" aria-expanded="false" id="search-switch" class="btn-plain scale-animation lg:!hidden rounded-lg w-11 h-11 active:scale-90">
  <Icon icon="material-symbols:search" aria-hidden="true" class="text-[1.25rem]" />
</button>

<div id="search-panel" data-floating-panel inert aria-hidden="true" aria-label="搜索结果" role="region" aria-busy={state.status === 'loading'} class="float-panel float-panel-closed search-panel absolute md:w-[30rem] top-20 left-4 md:left-[unset] right-4 shadow-2xl rounded-2xl p-2 max-h-[70vh] overflow-y-auto">
  <div role="search" aria-label="站内搜索" class="flex relative lg:hidden items-center h-11 rounded-xl bg-black/[0.04] dark:bg-white/5">
    <Icon icon="material-symbols:search" aria-hidden="true" class="absolute text-[1.25rem] pointer-events-none ml-3 text-black/30 dark:text-white/30" />
    <input type="search" aria-label={i18n(I18nKey.search)} placeholder={i18n(I18nKey.search)} bind:value={keyword} class="pl-10 pr-3 w-full h-full text-sm bg-transparent outline-0 text-black/75 dark:text-white/75" />
  </div>
  {#if !import.meta.env.PROD}
    <p class="px-3 py-2 text-sm text-75">开发模式使用演示数据；生产构建后才可验证全文搜索。</p>
  {/if}
  <p role="status" aria-live="polite" aria-atomic="true" class="px-3 py-2 text-sm text-75">
    {#if state.status === 'idle'}输入关键词，搜索文章。
    {:else if state.status === 'loading'}正在搜索…
    {:else if state.status === 'error'}搜索暂时无法加载，请稍后重试，或通过归档查找文章。
    {:else if state.status === 'empty'}没有找到“{state.query}”的相关文章。
    {:else}找到 {state.results.length} 篇相关文章。
    {/if}
  </p>
  {#each state.results as item}
    <a href={item.url} class="transition group block rounded-xl text-lg px-3 py-2 hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]">
      <div class="transition text-90 inline-flex font-bold group-hover:text-[var(--primary)]">{item.meta.title}<Icon icon="fa6-solid:chevron-right" aria-hidden="true" class="text-[0.75rem] translate-x-1 my-auto text-[var(--primary)]" /></div>
      <div class="transition text-sm text-75">{@html item.excerpt}</div>
    </a>
  {/each}
  <a href={url('/archive/')} class="block rounded-lg px-3 py-2 text-sm text-[var(--primary)] underline">浏览全部归档</a>
</div>
