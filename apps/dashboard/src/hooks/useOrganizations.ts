/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { OrganizationsContext } from '@/contexts/OrganizationsContext'
import { useContext } from 'react'

export function useOrganizations() {
  const context = useContext(OrganizationsContext)

  if (!context) {
    throw new Error('useOrganizations must be used within a OrganizationsProvider')
  }

  return context
}
