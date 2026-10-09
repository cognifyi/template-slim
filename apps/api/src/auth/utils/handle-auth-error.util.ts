/*
 * Copyright TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpException, ServiceUnavailableException } from '@nestjs/common'

export function handleAuthError(error: unknown, message: string): void {
  if (!(error instanceof HttpException) || error.getStatus() >= 500) {
    throw new ServiceUnavailableException(message, { cause: error })
  }
}
