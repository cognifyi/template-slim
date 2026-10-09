/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { getJestProjectsAsync } from '@nx/jest'

export default async () => ({
  projects: await getJestProjectsAsync(),
})
