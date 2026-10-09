/*
 * Copyright TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ForbiddenException } from '@nestjs/common'

export class AccessDeniedException extends ForbiddenException {
  constructor() {
    super('Access denied')
  }
}
