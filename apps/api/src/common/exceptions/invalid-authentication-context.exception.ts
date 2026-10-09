/*
 * Copyright TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ForbiddenException } from '@nestjs/common'

export class InvalidAuthenticationContextException extends ForbiddenException {
  constructor() {
    super('Invalid authentication context')
  }
}
