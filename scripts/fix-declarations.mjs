#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const DECLARATIONS_DIR = new URL('../types', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')

const TS_EXTENSION_REGEX = /(['"])(\.\.?[\\/][^'"]*)\.ts(['"])/g

function findDtsFiles(dir) {
    const results = []
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)
        const stat = statSync(full)
        if (stat.isDirectory()) {
            results.push(...findDtsFiles(full))
        } else if (entry.endsWith('.d.ts')) {
            results.push(full)
        }
    }
    return results
}

function fixFile(filePath) {
    let content = readFileSync(filePath, 'utf8')
    const fixed = content.replace(TS_EXTENSION_REGEX, '$1$2.js$3')
    if (fixed !== content) {
        writeFileSync(filePath, fixed, 'utf8')
        console.log(`Fixed: ${relative(DECLARATIONS_DIR, filePath)}`)
    }
}

for (const file of findDtsFiles(DECLARATIONS_DIR)) {
    fixFile(file)
}
