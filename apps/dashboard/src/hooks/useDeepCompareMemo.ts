/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import isEqual from 'fast-deep-equal'
import { useRef } from 'react'

export function useDeepCompareMemo<T>(value: T) {
  const ref = useRef<T>(value)

  if (!isEqual(value, ref.current)) {
    ref.current = value
  }

  return ref.current
}
