/*
 * Copyright TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { corsOptions } from './cors-options'

describe('corsOptions', () => {
  it('does not enable credentials with reflected origins', () => {
    expect(corsOptions.credentials).toBe(false)
  })
})
