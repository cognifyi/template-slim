/*
 * Copyright TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Meta, StoryObj } from '@storybook/react'
import { Calendar } from '../calendar'

const meta: Meta<typeof Calendar> = {
  title: 'UI/Calendar',
  component: Calendar,
}

export default meta
type Story = StoryObj<typeof Calendar>

export const Default: Story = {
  args: {
    mode: 'single',
  },
}
