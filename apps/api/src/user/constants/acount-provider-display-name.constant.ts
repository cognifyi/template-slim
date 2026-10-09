/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AccountProvider } from '../enums/account-provider.enum'

export const ACCOUNT_PROVIDER_DISPLAY_NAME: Record<AccountProvider, string> = {
  [AccountProvider.GOOGLE]: 'Google',
  [AccountProvider.GITHUB]: 'GitHub',
}
