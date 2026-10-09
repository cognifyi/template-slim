/*
 * Copyright 2025 Daytona Platforms Inc.
 * SPDX-License-Identifier: AGPL-3.0
 */

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { CreateOrganizationInternalDto } from '../dto/create-organization.internal.dto'
import { UpdateOrganizationQuotaDto } from '../dto/update-organization-quota.dto'
import { Organization } from '../entities/organization.entity'
import { OrganizationUser } from '../entities/organization-user.entity'
import { OrganizationMemberRole } from '../enums/organization-member-role.enum'
import { OnAsyncEvent } from '../../common/decorators/on-async-event.decorator'
import { UserEvents } from '../../user/constants/user-events.constant'
import { UserCreatedEvent } from '../../user/events/user-created.event'
import { UserDeletedEvent } from '../../user/events/user-deleted.event'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { OrganizationEvents } from '../constants/organization-events.constant'
import { CreateOrganizationQuotaDto } from '../dto/create-organization-quota.dto'
import { UserEmailVerifiedEvent } from '../../user/events/user-email-verified.event'
import { SystemRole } from '../../user/enums/system-role.enum'
import { TypedConfigService } from '../../config/typed-config.service'
import { LogExecution } from '../../common/decorators/log-execution.decorator'
import { TrackJobExecution } from '../../common/decorators/track-job-execution.decorator'
import { TrackableJobExecutions } from '../../common/interfaces/trackable-job-executions'
import { WithInstrumentation } from '../../common/decorators/otel.decorator'
import { EncryptionService } from '../../encryption/encryption.service'
import { OtelConfigDto } from '../dto/otel-config.dto'

@Injectable()
export class OrganizationService implements TrackableJobExecutions {
  activeJobs = new Set<string>()

  private readonly logger = new Logger(OrganizationService.name)
  private defaultOrganizationQuota: CreateOrganizationQuotaDto

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: TypedConfigService,
    private readonly encryptionService: EncryptionService,
  ) {
    this.defaultOrganizationQuota = this.configService.getOrThrow('defaultOrganizationQuota')
  }

  async create(
    createOrganizationDto: CreateOrganizationInternalDto,
    createdBy: string,
    personal = false,
    creatorEmailVerified = false,
  ): Promise<Organization> {
    return this.createWithEntityManager(
      this.organizationRepository.manager,
      createOrganizationDto,
      createdBy,
      creatorEmailVerified,
      personal,
    )
  }

  async findByUser(userId: string): Promise<Organization[]> {
    return this.organizationRepository.find({
      where: {
        users: {
          userId,
        },
      },
    })
  }

  async findOne(organizationId: string): Promise<Organization | null> {
    return this.organizationRepository.findOne({
      where: { id: organizationId },
    })
  }
  async findPersonal(userId: string): Promise<Organization> {
    return this.findPersonalWithEntityManager(this.organizationRepository.manager, userId)
  }

  async delete(organizationId: string): Promise<void> {
    const organization = await this.organizationRepository.findOne({ where: { id: organizationId } })

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`)
    }

    return this.removeWithEntityManager(this.organizationRepository.manager, organization)
  }

  async updateQuota(organizationId: string, updateDto: UpdateOrganizationQuotaDto): Promise<void> {
    const organization = await this.organizationRepository.findOne({ where: { id: organizationId } })
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`)
    }

    organization.maxCpuPerSandbox = updateDto.maxCpuPerSandbox ?? organization.maxCpuPerSandbox
    organization.maxMemoryPerSandbox = updateDto.maxMemoryPerSandbox ?? organization.maxMemoryPerSandbox
    organization.maxDiskPerSandbox = updateDto.maxDiskPerSandbox ?? organization.maxDiskPerSandbox
    organization.maxSnapshotSize = updateDto.maxSnapshotSize ?? organization.maxSnapshotSize
    organization.volumeQuota = updateDto.volumeQuota ?? organization.volumeQuota
    organization.snapshotQuota = updateDto.snapshotQuota ?? organization.snapshotQuota
    organization.authenticatedRateLimit = updateDto.authenticatedRateLimit ?? organization.authenticatedRateLimit
    organization.sandboxCreateRateLimit = updateDto.sandboxCreateRateLimit ?? organization.sandboxCreateRateLimit
    organization.sandboxLifecycleRateLimit =
      updateDto.sandboxLifecycleRateLimit ?? organization.sandboxLifecycleRateLimit
    organization.authenticatedRateLimitTtlSeconds =
      updateDto.authenticatedRateLimitTtlSeconds ?? organization.authenticatedRateLimitTtlSeconds
    organization.sandboxCreateRateLimitTtlSeconds =
      updateDto.sandboxCreateRateLimitTtlSeconds ?? organization.sandboxCreateRateLimitTtlSeconds
    organization.sandboxLifecycleRateLimitTtlSeconds =
      updateDto.sandboxLifecycleRateLimitTtlSeconds ?? organization.sandboxLifecycleRateLimitTtlSeconds
    organization.snapshotDeactivationTimeoutMinutes =
      updateDto.snapshotDeactivationTimeoutMinutes ?? organization.snapshotDeactivationTimeoutMinutes

    await this.organizationRepository.save(organization)
  }
  async suspend(
    organizationId: string,
    suspensionReason?: string,
    suspendedUntil?: Date,
    suspensionCleanupGracePeriodHours?: number,
  ): Promise<void> {
    const organization = await this.organizationRepository.findOne({ where: { id: organizationId } })
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`)
    }

    organization.suspended = true
    organization.suspensionReason = suspensionReason || null
    organization.suspendedUntil = suspendedUntil || null
    organization.suspendedAt = new Date()
    if (suspensionCleanupGracePeriodHours) {
      organization.suspensionCleanupGracePeriodHours = suspensionCleanupGracePeriodHours
    }

    await this.organizationRepository.save(organization)
  }

  async unsuspend(organizationId: string): Promise<void> {
    const organization = await this.organizationRepository.findOne({ where: { id: organizationId } })
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`)
    }

    organization.suspended = false
    organization.suspensionReason = null
    organization.suspendedUntil = null
    organization.suspendedAt = null

    await this.organizationRepository.save(organization)
  }
  async updateExperimentalConfig(
    organizationId: string,
    experimentalConfig: Record<string, any> | null,
  ): Promise<void> {
    const organization = await this.organizationRepository.findOne({ where: { id: organizationId } })
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`)
    }

    if (experimentalConfig && 'otel' in experimentalConfig) {
      throw new BadRequestException(
        'OpenTelemetry configuration has moved to a dedicated endpoint: PUT /organizations/:organizationId/otel-config',
      )
    }

    organization._experimentalConfig = experimentalConfig

    await this.organizationRepository.save(organization)
  }

  async updateOtelConfig(organizationId: string, dto: OtelConfigDto): Promise<void> {
    const organization = await this.organizationRepository.findOne({ where: { id: organizationId } })
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`)
    }

    if (typeof dto.endpoint !== 'string' || !dto.endpoint.trim()) {
      throw new BadRequestException('Invalid OpenTelemetry endpoint')
    }

    const existingHeaders = organization.otelConfig?.headers ?? {}
    const encryptedHeaders: Record<string, string> = {}
    if (dto.headers && typeof dto.headers === 'object') {
      for (const [key, value] of Object.entries(dto.headers)) {
        if (typeof key !== 'string' || !key.trim() || typeof value !== 'string' || !value.trim()) {
          continue
        }
        // Preserve existing encrypted value when the client sends back a redacted (all-asterisks) placeholder
        if (value.match(/\*/g)?.length === value.length && existingHeaders[key]) {
          encryptedHeaders[key] = existingHeaders[key]
        } else {
          encryptedHeaders[key] = await this.encryptionService.encrypt(value)
        }
      }
    }

    organization.otelConfig = {
      endpoint: dto.endpoint,
      headers: encryptedHeaders,
    }

    await this.organizationRepository.save(organization)
  }

  async deleteOtelConfig(organizationId: string): Promise<void> {
    const organization = await this.organizationRepository.findOne({ where: { id: organizationId } })
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`)
    }

    organization.otelConfig = null

    await this.organizationRepository.save(organization)
  }
  async getOtelConfigByOrganizationId(organizationId: string): Promise<OtelConfigDto | null> {
    const organization = await this.organizationRepository.findOne({ where: { id: organizationId } })
    return this.resolveOtelConfig(organization)
  }

  private async resolveOtelConfig(organization: Organization | null): Promise<OtelConfigDto | null> {
    if (!organization || !organization.otelConfig) {
      return null
    }

    const otelConfig = organization.otelConfig
    const decryptedHeaders: Record<string, string> = {}
    if (otelConfig.headers && typeof otelConfig.headers === 'object') {
      for (const [key, value] of Object.entries(otelConfig.headers)) {
        if (typeof key === 'string' && key.trim() && typeof value === 'string' && value.trim()) {
          decryptedHeaders[key] = await this.encryptionService.decrypt(value)
        }
      }
    }

    return {
      endpoint: otelConfig.endpoint,
      headers: Object.keys(decryptedHeaders).length > 0 ? decryptedHeaders : undefined,
    }
  }

  async findOrganizationsWithOtelConfig(): Promise<Organization[]> {
    return this.organizationRepository
      .createQueryBuilder('organization')
      .where(`organization."otelConfig" ->> 'endpoint' IS NOT NULL`)
      .andWhere(`organization."otelConfig" ->> 'endpoint' != ''`)
      .getMany()
  }

  private async createWithEntityManager(
    entityManager: EntityManager,
    createOrganizationDto: CreateOrganizationInternalDto,
    createdBy: string,
    creatorEmailVerified: boolean,
    personal = false,
    quota: CreateOrganizationQuotaDto = this.defaultOrganizationQuota,
  ): Promise<Organization> {
    if (personal) {
      const count = await entityManager.count(Organization, {
        where: { createdBy, personal: true },
      })
      if (count > 0) {
        throw new ForbiddenException('Personal organization already exists')
      }
    }

    // set some limit to the number of created organizations
    const createdCount = await entityManager.count(Organization, {
      where: { createdBy },
    })
    if (createdCount >= 10) {
      throw new ForbiddenException('You have reached the maximum number of created organizations')
    }

    let organization = new Organization(createOrganizationDto.defaultRegionId)

    organization.name = createOrganizationDto.name
    organization.createdBy = createdBy
    organization.personal = personal

    organization.maxCpuPerSandbox = quota.maxCpuPerSandbox
    organization.maxMemoryPerSandbox = quota.maxMemoryPerSandbox
    organization.maxDiskPerSandbox = quota.maxDiskPerSandbox
    organization.snapshotQuota = quota.snapshotQuota
    organization.maxSnapshotSize = quota.maxSnapshotSize
    organization.volumeQuota = quota.volumeQuota

    if (!creatorEmailVerified && !this.configService.get('skipUserEmailVerification')) {
      organization.suspended = true
      organization.suspendedAt = new Date()
      organization.suspensionReason = 'Please verify your email address'
    }

    const owner = new OrganizationUser()
    owner.userId = createdBy
    owner.role = OrganizationMemberRole.OWNER

    organization.users = [owner]

    await entityManager.transaction(async (em) => {
      organization = await em.save(organization)
      await this.eventEmitter.emitAsync(OrganizationEvents.CREATED, organization)
    })

    return organization
  }

  private async removeWithEntityManager(
    entityManager: EntityManager,
    organization: Organization,
    force = false,
  ): Promise<void> {
    if (!force) {
      if (organization.personal) {
        throw new ForbiddenException('Cannot delete personal organization')
      }
    }
    await entityManager.remove(organization)
  }

  private async unsuspendPersonalWithEntityManager(entityManager: EntityManager, userId: string): Promise<void> {
    const organization = await this.findPersonalWithEntityManager(entityManager, userId)

    organization.suspended = false
    organization.suspendedAt = null
    organization.suspensionReason = null
    organization.suspendedUntil = null
    await entityManager.save(organization)
  }

  private async findPersonalWithEntityManager(entityManager: EntityManager, userId: string): Promise<Organization> {
    const organization = await entityManager.findOne(Organization, {
      where: { createdBy: userId, personal: true },
    })

    if (!organization) {
      throw new NotFoundException(`Personal organization for user ${userId} not found`)
    }

    return organization
  }
  @OnAsyncEvent({
    event: UserEvents.CREATED,
  })
  @TrackJobExecution()
  async handleUserCreatedEvent(payload: UserCreatedEvent): Promise<Organization> {
    return this.createWithEntityManager(
      payload.entityManager,
      {
        name: 'Personal',
        defaultRegionId: payload.personalOrganizationDefaultRegionId,
      },
      payload.user.id,
      payload.user.role === SystemRole.ADMIN ? true : payload.user.emailVerified,
      true,
      payload.personalOrganizationQuota,
    )
  }

  @OnAsyncEvent({
    event: UserEvents.EMAIL_VERIFIED,
  })
  @TrackJobExecution()
  async handleUserEmailVerifiedEvent(payload: UserEmailVerifiedEvent): Promise<void> {
    await this.unsuspendPersonalWithEntityManager(payload.entityManager, payload.userId)
  }

  @OnAsyncEvent({
    event: UserEvents.DELETED,
  })
  @TrackJobExecution()
  async handleUserDeletedEvent(payload: UserDeletedEvent): Promise<void> {
    const organization = await this.findPersonalWithEntityManager(payload.entityManager, payload.userId)

    await this.removeWithEntityManager(payload.entityManager, organization, true)
  }

  assertOrganizationIsNotSuspended(organization: Organization): void {
    if (!organization.suspended) {
      return
    }

    if (organization.suspendedUntil ? organization.suspendedUntil > new Date() : true) {
      if (organization.suspensionReason) {
        throw new ForbiddenException(`Organization is suspended: ${organization.suspensionReason}`)
      } else {
        throw new ForbiddenException('Organization is suspended')
      }
    }
  }
}
