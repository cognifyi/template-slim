/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMutation } from '@tanstack/react-query'
import { useApi } from '../useApi'

export const useEnrollInSmsMfaMutation = () => {
  const { userApi } = useApi()

  return useMutation({
    mutationFn: async () => {
      const response = await userApi.enrollInSmsMfa()
      return response.data
    },
  })
}
