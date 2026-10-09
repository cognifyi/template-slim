/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
