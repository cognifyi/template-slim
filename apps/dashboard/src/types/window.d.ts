/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

interface Window {
  pylon?: {
    chat_settings: {
      app_id: string
      email: string
      name: string
      avatar_url?: string
      email_hash?: string
    }
  }
  Pylon?: {
    (command: 'show' | 'hide'): void
    (command: 'onShow' | 'onHide', callback: (() => void) | null): void
    (command: 'onChangeUnreadMessagesCount', callback: ((count: number) => void) | null): void
  }
}
