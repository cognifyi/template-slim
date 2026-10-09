/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlaygroundSandboxContext } from '@/providers/PlaygroundSandboxProvider'
import { UseSandboxSessionResult } from '@/hooks/useSandboxSession'
import { useContext } from 'react'

export type UsePlaygroundSandboxResult = UseSandboxSessionResult

export function usePlaygroundSandbox(): UsePlaygroundSandboxResult {
  const context = useContext(PlaygroundSandboxContext)

  if (!context) {
    throw new Error('usePlaygroundSandbox must be used within a <PlaygroundSandboxProvider />')
  }

  return context
}
