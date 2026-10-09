/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Reflector } from '@nestjs/core'
import { OrganizationResourcePermission } from '../enums/organization-resource-permission.enum'

/**
 * Marks a controller or handler as requiring all of the specified resource permissions.
 *
 * Evaluated by `OrganizationAuthContextGuard`.
 */
export const RequiredOrganizationResourcePermissions = Reflector.createDecorator<OrganizationResourcePermission[]>()
