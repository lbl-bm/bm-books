import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const script = fileURLToPath(new URL('../scripts/new-post.js', import.meta.url))

test('new posts are drafts and existing content is never overwritten', () => {
  const folder = mkdtempSync(path.join(tmpdir(), 'bm-books-post-test-'))
  try {
    const run = name => spawnSync(process.execPath, [script, name], { cwd: folder, encoding: 'utf8' })
    assert.equal(run('中文笔记').status, 0)
    const post = path.join(folder, 'src/content/posts/中文笔记.md')
    const source = readFileSync(post, 'utf8')
    assert.match(source, /draft: true/)
    assert.match(source, /title: "中文笔记"/)
    assert.notEqual(run('中文笔记').status, 0)
    assert.equal(readFileSync(post, 'utf8'), source)
    assert.notEqual(run('../escape').status, 0)
    assert.notEqual(run('unsupported.mdx').status, 0)
    assert.equal(existsSync(path.join(folder, 'src/content/escape.md')), false)
  } finally {
    assert.equal(path.dirname(path.resolve(folder)), path.resolve(tmpdir()))
    assert.ok(path.basename(folder).startsWith('bm-books-post-test-'))
    rmSync(folder, { recursive: true, force: true })
  }
})
