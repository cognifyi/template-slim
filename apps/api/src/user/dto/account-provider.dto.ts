/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProperty, ApiSchema } from '@nestjs/swagger'
import { IsString } from 'class-validator'

@ApiSchema({ name: 'AccountProvider' })
export class AccountProviderDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsString()
  displayName: string
}
