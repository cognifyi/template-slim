/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpException, HttpStatus } from '@nestjs/common'

export class ForbiddenOperationError extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.FORBIDDEN)
  }
}
