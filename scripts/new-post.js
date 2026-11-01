/* This is a script to create a new post markdown file with front-matter */

import fs from "fs"
import path from "path"

function getDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

const args = process.argv.slice(2)

if (args.length === 0) {
  console.error(`Error: No filename argument provided
Usage: npm run new-post -- <filename>`)
  process.exit(1) // Terminate the script and return error code 1
}

let fileName = args[0]
if (path.isAbsolute(fileName) || fileName.split(/[\\/]/).includes('..')) {
  console.error('Error: Use a relative post filename inside src/content/posts.')
  process.exit(1)
}

// Add .md extension if not present
const fileExtensionRegex = /\.md$/i
if (/\.mdx$/i.test(fileName)) {
  console.error('Error: This blog supports Markdown (.md); MDX is not configured.')
  process.exit(1)
}
if (!fileExtensionRegex.test(fileName)) {
  fileName += ".md"
}

const targetDir = "./src/content/posts/"
const fullPath = path.join(targetDir, fileName)

if (fs.existsSync(fullPath)) {
  console.error(`Error: File ${fullPath} already exists `)
  process.exit(1)
}

// recursive mode creates multi-level directories
const dirPath = path.dirname(fullPath)
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
}

const content = `---
title: ${JSON.stringify(path.basename(fileName, '.md'))}
published: ${getDate()}
description: ''
image: ''
tags: []
category: ''
draft: true
lang: ''
---
`

fs.writeFileSync(path.join(targetDir, fileName), content)

console.log(`Post ${fullPath} created`)
