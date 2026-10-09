/*
 * Copyright TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProperty, ApiSchema } from '@nestjs/swagger'

@ApiSchema({ name: 'OtelConfig' })
export class OtelConfigDto {
  @ApiProperty({
    description: 'Endpoint',
  })
  endpoint: string

  @ApiProperty({
    description: 'Headers',
    example: {
      'x-api-key': 'my-api-key',
    },
    nullable: true,
    required: false,
    additionalProperties: { type: 'string' },
  })
  headers?: Record<string, string>
}
