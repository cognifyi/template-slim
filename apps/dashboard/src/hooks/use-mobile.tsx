/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMatchMedia } from './useMatchMedia'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  return useMatchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
}
