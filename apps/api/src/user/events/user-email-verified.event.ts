/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { EntityManager } from 'typeorm'

export class UserEmailVerifiedEvent {
  constructor(
    public readonly entityManager: EntityManager,
    public readonly userId: string,
  ) {}
}
