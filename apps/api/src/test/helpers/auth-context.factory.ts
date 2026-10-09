/*
 * Copyright TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { SystemRole } from '../../user/enums/system-role.enum'
import { OrganizationMemberRole } from '../../organization/enums/organization-member-role.enum'
import { UserAuthContext } from '../../common/interfaces/user-auth-context.interface'
import { OrganizationAuthContext } from '../../common/interfaces/organization-auth-context.interface'
import { ProxyAuthContext } from '../../common/interfaces/proxy-auth-context.interface'
import { SshGatewayAuthContext } from '../../common/interfaces/ssh-gateway-auth-context.interface'
import { HealthCheckAuthContext } from '../../common/interfaces/health-check-auth-context.interface'
import { OtelCollectorAuthContext } from '../../common/interfaces/otel-collector-auth-context.interface'
import { MOCK_USER_ID, MOCK_USER_EMAIL, MOCK_ORGANIZATION_ID } from './constants'
import { createMockOrganization, createMockOrganizationUser } from './entity.factory'

export function createMockUserAuthContext(overrides?: Partial<Omit<UserAuthContext, 'role'>>): UserAuthContext {
  return {
    role: SystemRole.USER,
    userId: MOCK_USER_ID,
    email: MOCK_USER_EMAIL,
    ...overrides,
  }
}

export function createMockAdminUserAuthContext(overrides?: Partial<Omit<UserAuthContext, 'role'>>): UserAuthContext {
  return {
    role: SystemRole.ADMIN,
    userId: MOCK_USER_ID,
    email: MOCK_USER_EMAIL,
    ...overrides,
  }
}

export function createMockOrganizationAuthContext(
  overrides?: Partial<Omit<OrganizationAuthContext, 'role'>>,
): OrganizationAuthContext {
  return {
    role: SystemRole.USER,
    userId: MOCK_USER_ID,
    email: MOCK_USER_EMAIL,
    organizationId: MOCK_ORGANIZATION_ID,
    organization: createMockOrganization(),
    organizationUser: createMockOrganizationUser(),
    ...overrides,
  }
}

export function createMockOwnerOrganizationAuthContext(
  overrides?: Partial<Omit<OrganizationAuthContext, 'role' | 'organizationUser'>>,
): OrganizationAuthContext {
  return {
    role: SystemRole.USER,
    userId: MOCK_USER_ID,
    email: MOCK_USER_EMAIL,
    organizationId: MOCK_ORGANIZATION_ID,
    organization: createMockOrganization(),
    organizationUser: createMockOrganizationUser({ role: OrganizationMemberRole.OWNER }),
    ...overrides,
  }
}
export function createMockProxyAuthContext(overrides?: Partial<Omit<ProxyAuthContext, 'role'>>): ProxyAuthContext {
  return {
    role: 'proxy',
    ...overrides,
  }
}

export function createMockSshGatewayAuthContext(
  overrides?: Partial<Omit<SshGatewayAuthContext, 'role'>>,
): SshGatewayAuthContext {
  return {
    role: 'ssh-gateway',
    ...overrides,
  }
}

export function createMockHealthCheckAuthContext(
  overrides?: Partial<Omit<HealthCheckAuthContext, 'role'>>,
): HealthCheckAuthContext {
  return {
    role: 'health-check',
    ...overrides,
  }
}

export function createMockOtelCollectorAuthContext(
  overrides?: Partial<Omit<OtelCollectorAuthContext, 'role'>>,
): OtelCollectorAuthContext {
  return {
    role: 'otel-collector',
    ...overrides,
  }
}
