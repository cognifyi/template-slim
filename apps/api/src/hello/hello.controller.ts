/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Public } from '../auth/decorators/public.decorator'
import { AuthStrategy } from '../auth/decorators/auth-strategy.decorator'
import { AuthStrategyType } from '../auth/enums/auth-strategy-type.enum'
import { AnonymousRateLimitGuard } from '../common/guards/anonymous-rate-limit.guard'
import { AuthenticatedRateLimitGuard } from '../common/guards/authenticated-rate-limit.guard'
import { TypedConfigService } from '../config/typed-config.service'

// Example module for new projects: copy this folder to start a new resource.
// Public route:  GET /api/v1/hello
// Secured route: GET /api/v1/hello/secure (user API key required)
@Controller('v1/hello')
export class HelloController {
  constructor(private readonly configService: TypedConfigService) {}

  @Get()
  @Public()
  @UseGuards(AnonymousRateLimitGuard)
  @ApiOperation({ summary: 'Public hello', operationId: 'hello' })
  @ApiResponse({ status: 200, description: 'Greeting with API version' })
  hello() {
    return {
      message: 'Hello from TemplateSlim',
      version: this.configService.get('version'),
      environment: this.configService.get('environment'),
    }
  }

  @Get('secure')
  @ApiBearerAuth()
  @AuthStrategy(AuthStrategyType.API_KEY)
  @UseGuards(AuthenticatedRateLimitGuard)
  @ApiOperation({ summary: 'Authenticated hello', operationId: 'helloSecure' })
  @ApiResponse({ status: 200, description: 'Greeting for authenticated callers' })
  helloSecure() {
    return {
      message: 'Hello, authenticated user',
      version: this.configService.get('version'),
    }
  }
}
