/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuditLog } from '../entities/audit-log.entity'

export class AuditLogCreatedEvent {
  constructor(public readonly auditLog: AuditLog) {}
}
