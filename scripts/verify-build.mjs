import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const project = fileURLToPath(new URL('../', import.meta.url))
const output = path.join(project, 'dist')
const site = new URL('https://lbl-bm.github.io/bm-books/')
const base = site.pathname

function filesUnder(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(folder, entry.name)
    return entry.isDirectory() ? filesUnder(target) : [target]
  })
}

function attributes(tag) {
  const attrs = {}
  const matcher = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g
  for (const match of tag.matchAll(matcher)) attrs[match[1]] = match[2] ?? match[3] ?? match[4]
  return attrs
}

let references = 0
function verifyReference(reference, from) {
  if (!reference || reference.startsWith('#') || /^(?:data:|mailto:|tel:|javascript:)/i.test(reference)) return
  const target = new URL(reference.replaceAll('&amp;', '&'), from)
  if (target.origin !== site.origin) return
  assert.ok(target.pathname.startsWith(base), `Missing Pages base path: ${target.href} from ${from}`)
  const decoded = decodeURIComponent(target.pathname.slice(base.length))
  let local = path.resolve(output, decoded)
  assert.ok(local === output || local.startsWith(output + path.sep), 'Reference escaped dist')
  if (existsSync(local) && statSync(local).isDirectory()) local = path.join(local, 'index.html')
  assert.ok(existsSync(local), `Missing output: ${target.href} from ${from}`)
  references++
}

assert.ok(existsSync(output), 'Run the production build first')
const htmlFiles = filesUnder(output).filter(file => file.endsWith('.html'))
assert.ok(htmlFiles.length, 'The build has no HTML pages')
for (const file of htmlFiles) {
  const relative = path.relative(output, file).split(path.sep).join('/').replace(/index\.html$/, '')
  const pageUrl = new URL(relative, site)
  const html = readFileSync(file, 'utf8')
  const tags = html.match(/<[a-z][^>]*>/gi) ?? []
  let canonical = false
  let rssLink = false
  for (const tag of tags) {
    const attrs = attributes(tag)
    for (const name of ['href', 'src']) verifyReference(attrs[name], pageUrl)
    if (attrs.rel === 'canonical') {
      assert.equal(new URL(attrs.href).href, pageUrl.href, `Wrong canonical for ${relative}`)
      canonical = true
    }
    if (attrs.rel === 'alternate' && attrs.type === 'application/rss+xml') {
      assert.equal(new URL(attrs.href).href, new URL('rss.xml', site).href)
      rssLink = true
    }
  }
  assert.ok(canonical, `No canonical on ${relative}`)
  assert.ok(rssLink, `No RSS discovery link on ${relative}`)
  if (relative.startsWith('posts/')) assert.match(html, /<h1\b[^>]*\bid=(?:"post-title"|'post-title'|post-title)(?:\s|>)/)
}

const rss = readFileSync(path.join(output, 'rss.xml'), 'utf8')
for (const item of rss.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>/g)) verifyReference(item[1], site)
assert.match(rss, /<language>zh-CN<\/language>/)
const robots = readFileSync(path.join(output, 'robots.txt'), 'utf8')
assert.ok(robots.includes(new URL('sitemap-index.xml', site).href))
for (const file of ['sitemap-index.xml', 'sitemap-0.xml']) {
  const xml = readFileSync(path.join(output, file), 'utf8')
  for (const entry of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) verifyReference(entry[1], site)
}

const postsRoot = path.join(project, 'src/content/posts')
const drafts = filesUnder(postsRoot).filter(file => file.endsWith('.md')).filter(file => {
  const frontmatter = readFileSync(file, 'utf8').split(/^---\s*$/m)[1] ?? ''
  return !/^draft:\s*false\s*(?:#.*)?$/m.test(frontmatter)
})
for (const file of drafts) {
  const slug = path.relative(postsRoot, file).split(path.sep).join('/').replace(/\.md$/, '').replace(/\/index$/, '')
  assert.equal(existsSync(path.join(output, 'posts', slug, 'index.html')), false, `Draft was published: ${slug}`)
  assert.ok(!rss.includes(new URL(`posts/${slug}/`, site).href), `Draft is in RSS: ${slug}`)
}
assert.ok(existsSync(path.join(output, 'pagefind/pagefind.js')), 'Pagefind bundle is missing')
assert.ok(filesUnder(path.join(output, 'pagefind')).some(file => file.endsWith('.wasm') || /^wasm\..*\.pagefind$/.test(path.basename(file))), 'Pagefind search runtime is missing')
console.log(`Verified ${htmlFiles.length} pages, ${references} links/assets, ${drafts.length} excluded drafts, RSS, sitemaps and Pagefind output.`)
