/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DaytonaConfiguration } from '@template-slim/api-client'

export type DashboardConfig = DaytonaConfiguration & {
  apiUrl: string
}
