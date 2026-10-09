/*
 * Copyright TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { SystemRole } from '../../user/enums/system-role.enum'
export interface BaseAuthContext {
  role:
    | SystemRole
    | 'proxy'
    | 'ssh-gateway'
    | 'otel-collector'
    | 'health-check'
}

export function isBaseAuthContext(user: unknown): user is BaseAuthContext {
  return typeof user === 'object' && user !== null && 'role' in user
}
