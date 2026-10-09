/*
 * Copyright TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { OrganizationMemberRole } from '../../organization/enums/organization-member-role.enum'
import { Organization } from '../../organization/entities/organization.entity'
import { OrganizationUser } from '../../organization/entities/organization-user.entity'
import { MOCK_ORGANIZATION_ID, MOCK_USER_ID } from './constants'

export function createMockOrganization(overrides?: Partial<Organization>): Organization {
  return {
    id: MOCK_ORGANIZATION_ID,
    ...overrides,
  } as Organization
}

export function createMockOrganizationUser(overrides?: Partial<OrganizationUser>): OrganizationUser {
  return {
    organizationId: MOCK_ORGANIZATION_ID,
    userId: MOCK_USER_ID,
    role: OrganizationMemberRole.MEMBER,
    assignedRoles: [],
    ...overrides,
  } as OrganizationUser
}
