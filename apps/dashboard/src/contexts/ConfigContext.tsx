/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DashboardConfig } from '@/types/DashboardConfig'
import { createContext } from 'react'

export const ConfigContext = createContext<DashboardConfig | null>(null)
