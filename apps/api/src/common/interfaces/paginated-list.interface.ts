/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PaginatedList<T> {
  items: T[]
  total: number
  page: number
  totalPages: number
  nextToken?: string
}
