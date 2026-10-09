/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpException, HttpStatus } from '@nestjs/common'

export class DefaultRegionRequiredException extends HttpException {
  constructor(
    message = 'This organization does not have a default region. Please open the Daytona Dashboard to set a default region.',
  ) {
    super(message, HttpStatus.BAD_REQUEST)
  }
}
