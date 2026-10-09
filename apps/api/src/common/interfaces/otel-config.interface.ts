/*
 * Copyright TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OTELConfig {
  enabled: boolean
  endpoint: string
  headers: Record<string, string>
}
