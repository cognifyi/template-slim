/*
 * Copyright TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Daytona } from '@template-slim/sdk'

export type PreviewKind = 'binary' | 'image' | 'text'

export type SandboxInstance = Awaited<ReturnType<Daytona['get']>>

export type SandboxFileSystemNode = {
  group: string
  id: string
  isDir: boolean
  modTime: string
  mode: string
  name: string
  owner: string
  path: string
  permissions: string
  size: number
}
