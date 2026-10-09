/*
 * Copyright TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpException, HttpStatus } from '@nestjs/common'

export class StateChangeInProgressError extends HttpException {
  constructor(message = 'Sandbox state change in progress') {
    super(message, HttpStatus.CONFLICT)
  }
}
