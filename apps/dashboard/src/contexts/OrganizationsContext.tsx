/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Organization } from '@template-slim/api-client'
import { createContext } from 'react'

export interface IOrganizationsContext {
  organizations: Organization[]
  refreshOrganizations: (selectedOrganizationId?: string) => Promise<void>
}

export const OrganizationsContext = createContext<IOrganizationsContext | undefined>(undefined)
