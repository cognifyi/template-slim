/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

export function fromAxiosError(error: any): Error {
  return new Error(error.response?.data?.message || error.response?.data || error.message || error)
}
