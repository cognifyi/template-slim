#!/usr/bin/env node
/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Initialize a new project from the template-slim monorepo template.
 *
 * Usage:
 *   node scripts/init.mjs --name <project> [--org <org>] [--api-port 3001]
 *                          [--web-port 3000] [--author <owner>]
 *
 *   --name      New project name, lowercase with hyphens (e.g. acme).
 *               Replaces every `template-slim` (+ Pascal/snake variants).
 *   --org       Container/npm org + Go owner (e.g. acme-org, default: <name>-org).
 *               Replaces every `template-org` / `TemplateOrg`.
 *   --api-port  NestJS API port (default 3001).
 *   --web-port  Next.js port (default 3000).
 *   --author    Copyright owner for LICENSE (default: <org>).
 *
 * After renaming it verifies:
 *   1. `go work sync` produces no diff,
 *   2. `yarn install --immutable` passes,
 *   3. `nx show projects` contains api/web/worker/e2e.
 */
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '')

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`)
  if (i === -1 || i + 1 >= process.argv.length) {
    return def
  }
  return process.argv[i + 1]
}

function pascal(s) {
  return s
    .split(/[-_]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('')
}

const name = arg('name', '')
if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
  console.error('error: --name is required (lowercase, hyphens), e.g. --name acme')
  process.exit(1)
}
const org = arg('org', `${name}-org`)
const apiPort = arg('api-port', '3001')
const webPort = arg('web-port', '3000')
const author = arg('author', org)

const renames = [
  ['template-slim', name],
  ['TemplateSlim', pascal(name)],
  ['template_slim', name.replace(/-/g, '_')],
  ['template-org', org],
  ['TemplateOrg', pascal(org)],
]

const SKIP_DIRS = new Set(['.git', 'node_modules', '.nx', '.venv', 'dist', 'build', '.yarn', '__pycache__'])
const SKIP_FILES = new Set(['yarn.lock', 'poetry.lock', 'go.work.sum', 'pnpm-lock.yaml', 'package-lock.json'])
// Never rename this script itself: it contains the placeholder strings as data.
// (It runs from the copy being initialized, so self-modification would corrupt
// the replacement table mid-walk.)
const SKIP_PATHS = new Set(['scripts/init.mjs'])

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) {
      continue
    }
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      walk(full, out)
    } else if (st.isFile() && !SKIP_FILES.has(entry)) {
      out.push(full)
    }
  }
  return out
}

let changed = 0
for (const file of walk(ROOT)) {
  if (SKIP_PATHS.has(relative(ROOT, file))) {
    continue
  }
  let content
  try {
    content = readFileSync(file, 'utf8')
  } catch {
    continue // binary file
  }
  let next = content
  for (const [from, to] of renames) {
    next = next.split(from).join(to)
  }
  if (next !== content) {
    writeFileSync(file, next)
    changed++
  }
}

// Targeted port replacements (a global 3000/3001 swap would hit timeouts).
const portFiles = [
  'apps/web/project.json',
  'apps/web/Dockerfile',
  'apps/api/Dockerfile',
  'apps/api/src/openapi.config.ts',
  'apps/api/src/generate-openapi.ts',
  '.devcontainer/devcontainer.json',
  'apps/e2e/playwright.config.ts',
  'apps/e2e/.env.e2e',
  'apps/e2e/docker-compose.e2e.yaml',
  'apps/web/src/lib/api-client.ts',
]
for (const rel of portFiles) {
  const file = join(ROOT, rel)
  if (!existsSync(file)) {
    continue
  }
  let content = readFileSync(file, 'utf8')
  // Replace API port first using the devcontainer/e2e context is ambiguous in
  // prose, so only swap the canonical localhost forms.
  content = content.split('localhost:3001').join(`localhost:${apiPort}`)
  content = content.split('localhost:3000').join(`localhost:${webPort}`)
  content = content.split('"port": 3000').join(`"port": ${webPort}`)
  content = content.split('PORT=3000').join(`PORT=${webPort}`)
  content = content.split('EXPOSE 3000').join(`EXPOSE ${webPort}`)
  content = content.split('EXPOSE 3001').join(`EXPOSE ${apiPort}`)
  writeFileSync(file, content)
}

// LICENSE author/year.
const licenseFile = join(ROOT, 'LICENSE')
if (existsSync(licenseFile)) {
  let license = readFileSync(licenseFile, 'utf8')
  license = license.replace('Copyright [yyyy] [name of copyright owner]', `Copyright ${new Date().getFullYear()} ${author}`)
  writeFileSync(licenseFile, license)
}

console.log(`renamed ${changed} files: template-slim -> ${name}, template-org -> ${org}`)

// --- verification ---
function sh(cmd, opts = {}) {
  return execSync(cmd, { cwd: ROOT, stdio: 'pipe', encoding: 'utf8', ...opts })
}

console.log('verifying: go work sync ...')
sh('go work sync')
const diff = sh('git diff --stat -- go.work go.work.sum */go.mod */go.sum || true')
if (diff.trim()) {
  console.error('go work sync produced a diff:\n' + diff)
  process.exit(1)
}

console.log('verifying: yarn install (refreshes lockfile after rename) ...')
sh('yarn install', { stdio: 'inherit' })

console.log('verifying: nx show projects ...')
const projects = sh('npx nx show projects').split('\n').map((l) => l.trim())
for (const need of ['api', 'web', 'worker', 'e2e']) {
  if (!projects.includes(need)) {
    console.error(`missing project: ${need} (got: ${projects.join(', ')})`)
    process.exit(1)
  }
}

console.log(`OK: ${name} initialized. Next: yarn build && yarn test`);
