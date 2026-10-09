/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Organization, OrganizationRolePermissionsEnum, OrganizationUser } from '@template-slim/api-client'

import { createContext } from 'react'

export interface ISelectedOrganizationContext {
  selectedOrganization: Organization | null
  authenticatedUserOrganizationMember: OrganizationUser | null
  authenticatedUserHasPermission: (permission: OrganizationRolePermissionsEnum) => boolean
  onSelectOrganization: (organizationId: string) => Promise<boolean>
}

export const SelectedOrganizationContext = createContext<ISelectedOrganizationContext | undefined>(undefined)
