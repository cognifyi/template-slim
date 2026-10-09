/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiClient } from '@/api/apiClient'
import { createContext } from 'react'

export const ApiContext = createContext<ApiClient | null>(null)
