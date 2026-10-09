/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateApiKeyPermissionsEnum } from '@template-slim/api-client'

export interface CreateApiKeyPermissionGroup {
  name: string
  permissions: CreateApiKeyPermissionsEnum[]
}
