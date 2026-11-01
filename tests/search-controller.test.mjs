import test from 'node:test'
import assert from 'node:assert/strict'
import { setImmediate } from 'node:timers/promises'
import { createSearchController } from '../src/utils/search-controller.ts'

const tick = () => new Promise(resolve => setTimeout(resolve, 8))
const hit = title => ({ data: async () => ({ url: `/bm-books/posts/${title}/`, meta: { title }, excerpt: title }) })

test('shows loading, results, empty state, and clears a query', async () => {
  const states = []
  const controller = createSearchController(async () => ({ search: async query => ({ results: query === 'missing' ? [] : [hit(query)] }) }), state => states.push(state), 0)
  controller.search('中文')
  assert.equal(states.at(-1).status, 'loading')
  await tick()
  assert.equal(states.at(-1).results[0].meta.title, '中文')
  controller.search('missing')
  await tick()
  assert.equal(states.at(-1).status, 'empty')
  controller.search(' ')
  assert.equal(states.at(-1).status, 'idle')
  assert.deepEqual(states.at(-1).results, [])
  controller.dispose()
})

test('a slower old request cannot overwrite a newer result', async () => {
  const requests = new Map()
  const states = []
  const controller = createSearchController(async () => ({ search: query => new Promise(resolve => requests.set(query, resolve)) }), state => states.push(state), 0)
  controller.search('old')
  await tick()
  controller.search('new')
  await tick()
  requests.get('new')({ results: [hit('new')] })
  await setImmediate()
  requests.get('old')({ results: [hit('old')] })
  await setImmediate()
  assert.equal(states.at(-1).results[0].meta.title, 'new')
  controller.dispose()
})

test('failed index loading has an error state; disposed requests stay silent', async () => {
  const states = []
  const controller = createSearchController(async () => { throw new Error('offline') }, state => states.push(state), 0)
  controller.search('query')
  await tick()
  assert.equal(states.at(-1).status, 'error')
  controller.search('late')
  const count = states.length
  controller.dispose()
  await tick()
  assert.equal(states.length, count)
})
