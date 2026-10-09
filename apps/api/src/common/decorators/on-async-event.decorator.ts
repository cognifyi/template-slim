/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { OnEvent, OnEventMetadata } from '@nestjs/event-emitter'

export function OnAsyncEvent({ event, options = {} }: OnEventMetadata): MethodDecorator {
  return OnEvent(event, {
    ...options,
    promisify: true,
    suppressErrors: false,
  })
}
