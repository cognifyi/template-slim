/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common'
import { OrganizationService } from './organization/services/organization.service'
import { UserService } from './user/user.service'
import { ApiKeyService } from './api-key/api-key.service'
import { EventEmitterReadinessWatcher } from '@nestjs/event-emitter'
import { SystemRole } from './user/enums/system-role.enum'
import { TypedConfigService } from './config/typed-config.service'
import { SchedulerRegistry } from '@nestjs/schedule'
import { OrganizationResourcePermission } from './organization/enums/organization-resource-permission.enum'

export const TEMPLATE_ADMIN_USER_ID = 'template-admin'

@Injectable()
export class AppService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(AppService.name)

  constructor(
    private readonly configService: TypedConfigService,
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
    private readonly apiKeyService: ApiKeyService,
    private readonly eventEmitterReadinessWatcher: EventEmitterReadinessWatcher,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Received shutdown signal: ${signal}. Shutting down gracefully...`)
    await this.stopAllCronJobs()
  }

  async onApplicationBootstrap() {
    if (this.configService.get('disableCronJobs') || this.configService.get('maintananceMode')) {
      await this.stopAllCronJobs()
    }

    await this.eventEmitterReadinessWatcher.waitUntilReady()

    await this.initializeAdminUser()
  }

  private async stopAllCronJobs(): Promise<void> {
    for (const cronName of this.schedulerRegistry.getCronJobs().keys()) {
      this.logger.debug(`Stopping cron job: ${cronName}`)
      this.schedulerRegistry.deleteCronJob(cronName)
    }
  }

  private async initializeAdminUser(): Promise<void> {
    if (await this.userService.findOne(TEMPLATE_ADMIN_USER_ID)) {
      return
    }

    const user = await this.userService.create({
      id: TEMPLATE_ADMIN_USER_ID,
      name: 'Template Admin',
      role: SystemRole.ADMIN,
    })
    const personalOrg = await this.organizationService.findPersonal(user.id)
    const { value } = await this.apiKeyService.createApiKey(
      personalOrg.id,
      user.id,
      TEMPLATE_ADMIN_USER_ID,
      Object.values(OrganizationResourcePermission),
      undefined,
      this.configService.getOrThrow('admin.apiKey'),
    )
    this.logger.log(
      `
=========================================
=========================================
Admin user created with API key: ${value}
=========================================
=========================================`,
    )
  }
}
