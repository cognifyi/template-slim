/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'
import { ApiOAuth2, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger'
import { AuthStrategy } from '../../auth/decorators/auth-strategy.decorator'
import { AuthStrategyType } from '../../auth/enums/auth-strategy-type.enum'
import { RequiredOrganizationMemberRole } from '../decorators/required-organization-member-role.decorator'
import { CreateOrganizationDto } from '../dto/create-organization.dto'
import { OrganizationDto } from '../dto/organization.dto'
import { OrganizationInvitationDto } from '../dto/organization-invitation.dto'
import { UpdateOrganizationQuotaDto } from '../dto/update-organization-quota.dto'
import { OrganizationMemberRole } from '../enums/organization-member-role.enum'
import { OrganizationAuthContextGuard } from '../guards/organization-auth-context.guard'
import { OrganizationService } from '../services/organization.service'
import { OrganizationUserService } from '../services/organization-user.service'
import { OrganizationInvitationService } from '../services/organization-invitation.service'
import { IsOrganizationAuthContext, IsUserAuthContext } from '../../common/decorators/auth-context.decorator'
import { UserAuthContext } from '../../common/interfaces/user-auth-context.interface'
import { RequiredSystemRole } from '../../user/decorators/required-system-role.decorator'
import { SystemRole } from '../../user/enums/system-role.enum'
import { OrganizationSuspensionDto } from '../dto/organization-suspension.dto'
import { UserService } from '../../user/user.service'
import { Audit, TypedRequest } from '../../audit/decorators/audit.decorator'
import { AuditAction } from '../../audit/enums/audit-action.enum'
import { AuditTarget } from '../../audit/enums/audit-target.enum'
import { EmailUtils } from '../../common/utils/email.util'
import { TypedConfigService } from '../../config/typed-config.service'
import { AuthenticatedRateLimitGuard } from '../../common/guards/authenticated-rate-limit.guard'
import { RequireFlagsEnabled } from '@openfeature/nestjs-sdk'
import { OtelCollectorAuthContextGuard } from '../guards/otel-collector-auth-context.guard'
import { OtelConfigDto } from '../dto/otel-config.dto'
import { OrganizationAuthContext } from '../../common/interfaces/organization-auth-context.interface'
import { UserAuthContextGuard } from '../../user/guards/user-auth-context.guard'

@Controller('organizations')
@ApiTags('organizations')
@ApiOAuth2(['openid', 'profile', 'email'])
@ApiBearerAuth()
@AuthStrategy(AuthStrategyType.JWT)
@UseGuards(AuthenticatedRateLimitGuard)
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly organizationUserService: OrganizationUserService,
    private readonly organizationInvitationService: OrganizationInvitationService,
    private readonly userService: UserService,
    private readonly configService: TypedConfigService,
  ) {}

  @Get('/invitations')
  @ApiOperation({
    summary: 'List organization invitations for authenticated user',
    operationId: 'listOrganizationInvitationsForAuthenticatedUser',
  })
  @ApiResponse({
    status: 200,
    description: 'List of organization invitations',
    type: [OrganizationInvitationDto],
  })
  @UseGuards(UserAuthContextGuard)
  async findInvitationsByUser(@IsUserAuthContext() authContext: UserAuthContext): Promise<OrganizationInvitationDto[]> {
    const invitations = await this.organizationInvitationService.findByUser(authContext.userId)
    return invitations.map(OrganizationInvitationDto.fromOrganizationInvitation)
  }

  @Get('/invitations/count')
  @ApiOperation({
    summary: 'Get count of organization invitations for authenticated user',
    operationId: 'getOrganizationInvitationsCountForAuthenticatedUser',
  })
  @ApiResponse({
    status: 200,
    description: 'Count of organization invitations',
    type: Number,
  })
  @UseGuards(UserAuthContextGuard)
  async getInvitationsCountByUser(@IsUserAuthContext() authContext: UserAuthContext): Promise<number> {
    return this.organizationInvitationService.getCountByUser(authContext.userId)
  }

  @Post('/invitations/:invitationId/accept')
  @ApiOperation({
    summary: 'Accept organization invitation',
    operationId: 'acceptOrganizationInvitation',
  })
  @ApiParam({
    name: 'invitationId',
    description: 'Invitation ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization invitation accepted successfully',
    type: OrganizationInvitationDto,
  })
  @Audit({
    action: AuditAction.ACCEPT,
    targetType: AuditTarget.ORGANIZATION_INVITATION,
    targetIdFromRequest: (req) => req.params.invitationId,
  })
  @UseGuards(UserAuthContextGuard)
  async acceptInvitation(
    @IsUserAuthContext() authContext: UserAuthContext,
    @Param('invitationId') invitationId: string,
  ): Promise<OrganizationInvitationDto> {
    const user = await this.userService.findOne(authContext.userId)
    if (!user.emailVerified && !this.configService.get('skipUserEmailVerification')) {
      throw new ForbiddenException('Please verify your email address')
    }

    try {
      const invitation = await this.organizationInvitationService.findOneOrFail(invitationId)
      if (!EmailUtils.areEqual(invitation.email, authContext.email)) {
        throw new ForbiddenException('User email does not match invitation email')
      }
    } catch (error) {
      throw new NotFoundException(`Organization invitation with ID ${invitationId} not found`)
    }

    const acceptedInvitation = await this.organizationInvitationService.accept(invitationId, authContext.userId)
    return OrganizationInvitationDto.fromOrganizationInvitation(acceptedInvitation)
  }

  @Post('/invitations/:invitationId/decline')
  @ApiOperation({
    summary: 'Decline organization invitation',
    operationId: 'declineOrganizationInvitation',
  })
  @ApiParam({
    name: 'invitationId',
    description: 'Invitation ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization invitation declined successfully',
  })
  @Audit({
    action: AuditAction.DECLINE,
    targetType: AuditTarget.ORGANIZATION_INVITATION,
    targetIdFromRequest: (req) => req.params.invitationId,
  })
  @UseGuards(UserAuthContextGuard)
  async declineInvitation(
    @IsUserAuthContext() authContext: UserAuthContext,
    @Param('invitationId') invitationId: string,
  ): Promise<void> {
    const user = await this.userService.findOne(authContext.userId)
    if (!user.emailVerified && !this.configService.get('skipUserEmailVerification')) {
      throw new ForbiddenException('Please verify your email address')
    }

    try {
      const invitation = await this.organizationInvitationService.findOneOrFail(invitationId)
      if (!EmailUtils.areEqual(invitation.email, authContext.email)) {
        throw new ForbiddenException('User email does not match invitation email')
      }
    } catch (error) {
      throw new NotFoundException(`Organization invitation with ID ${invitationId} not found`)
    }

    return this.organizationInvitationService.decline(invitationId)
  }

  @Post()
  @ApiOperation({
    summary: 'Create organization',
    operationId: 'createOrganization',
  })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully',
    type: OrganizationDto,
  })
  @Audit({
    action: AuditAction.CREATE,
    targetType: AuditTarget.ORGANIZATION,
    targetIdFromResult: (result: OrganizationDto) => result?.id,
    requestMetadata: {
      body: (req: TypedRequest<CreateOrganizationDto>) => ({
        name: req.body?.name,
        defaultRegionId: req.body?.defaultRegionId,
      }),
    },
  })
  @UseGuards(UserAuthContextGuard)
  async create(
    @IsUserAuthContext() authContext: UserAuthContext,
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<OrganizationDto> {
    const user = await this.userService.findOne(authContext.userId)
    if (!user.emailVerified && !this.configService.get('skipUserEmailVerification')) {
      throw new ForbiddenException('Please verify your email address')
    }

    const organization = await this.organizationService.create(createOrganizationDto, authContext.userId, false, true)
    return OrganizationDto.fromOrganization(organization)
  }
  @Get()
  @ApiOperation({
    summary: 'List organizations',
    operationId: 'listOrganizations',
  })
  @ApiResponse({
    status: 200,
    description: 'List of organizations',
    type: [OrganizationDto],
  })
  @UseGuards(UserAuthContextGuard)
  async findAll(@IsUserAuthContext() authContext: UserAuthContext): Promise<OrganizationDto[]> {
    const organizations = await this.organizationService.findByUser(authContext.userId)
    return organizations.map(OrganizationDto.fromOrganization)
  }

  @Get('/:organizationId')
  @ApiOperation({
    summary: 'Get organization by ID',
    operationId: 'getOrganization',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization details',
    type: OrganizationDto,
  })
  @UseGuards(OrganizationAuthContextGuard)
  async findOne(@Param('organizationId') organizationId: string): Promise<OrganizationDto> {
    const organization = await this.organizationService.findOne(organizationId)
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`)
    }

    return OrganizationDto.fromOrganization(organization)
  }

  @Delete('/:organizationId')
  @ApiOperation({
    summary: 'Delete organization',
    operationId: 'deleteOrganization',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Organization deleted successfully',
  })
  @UseGuards(OrganizationAuthContextGuard)
  @RequiredOrganizationMemberRole(OrganizationMemberRole.OWNER)
  @Audit({
    action: AuditAction.DELETE,
    targetType: AuditTarget.ORGANIZATION,
    targetIdFromRequest: (req) => req.params.organizationId,
  })
  async delete(@Param('organizationId') organizationId: string): Promise<void> {
    return this.organizationService.delete(organizationId)
  }
  @Patch('/:organizationId/quota')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Update organization quota',
    operationId: 'updateOrganizationQuota',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Organization quota updated successfully',
  })
  @AuthStrategy(AuthStrategyType.API_KEY)
  @RequiredSystemRole(SystemRole.ADMIN)
  @Audit({
    action: AuditAction.UPDATE_QUOTA,
    targetType: AuditTarget.ORGANIZATION,
    targetIdFromRequest: (req) => req.params.organizationId,
    requestMetadata: {
      body: (req: TypedRequest<UpdateOrganizationQuotaDto>) => ({
        maxCpuPerSandbox: req.body?.maxCpuPerSandbox,
        maxMemoryPerSandbox: req.body?.maxMemoryPerSandbox,
        maxDiskPerSandbox: req.body?.maxDiskPerSandbox,
        snapshotQuota: req.body?.snapshotQuota,
        maxSnapshotSize: req.body?.maxSnapshotSize,
        volumeQuota: req.body?.volumeQuota,
      }),
    },
  })
  async updateOrganizationQuota(
    @Param('organizationId') organizationId: string,
    @Body() updateDto: UpdateOrganizationQuotaDto,
  ): Promise<void> {
    await this.organizationService.updateQuota(organizationId, updateDto)
  }
  @Post('/:organizationId/leave')
  @ApiOperation({
    summary: 'Leave organization',
    operationId: 'leaveOrganization',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Organization left successfully',
  })
  @UseGuards(OrganizationAuthContextGuard)
  @Audit({
    action: AuditAction.LEAVE_ORGANIZATION,
  })
  async leave(
    @IsOrganizationAuthContext() authContext: OrganizationAuthContext,
    @Param('organizationId') organizationId: string,
  ): Promise<void> {
    return this.organizationUserService.delete(organizationId, authContext.userId)
  }

  @Post('/:organizationId/suspend')
  @ApiOperation({
    summary: 'Suspend organization',
    operationId: 'suspendOrganization',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID',
    type: 'string',
  })
  @ApiBody({
    type: OrganizationSuspensionDto,
    required: false,
  })
  @ApiResponse({
    status: 204,
    description: 'Organization suspended successfully',
  })
  @AuthStrategy(AuthStrategyType.API_KEY)
  @RequiredSystemRole(SystemRole.ADMIN)
  @Audit({
    action: AuditAction.SUSPEND,
    targetType: AuditTarget.ORGANIZATION,
    targetIdFromRequest: (req) => req.params.organizationId,
    requestMetadata: {
      body: (req: TypedRequest<OrganizationSuspensionDto>) => ({
        reason: req.body?.reason,
        until: req.body?.until,
      }),
    },
  })
  async suspend(
    @Param('organizationId') organizationId: string,
    @Body() organizationSuspensionDto?: OrganizationSuspensionDto,
  ): Promise<void> {
    return this.organizationService.suspend(
      organizationId,
      organizationSuspensionDto?.reason,
      organizationSuspensionDto?.until,
      organizationSuspensionDto?.suspensionCleanupGracePeriodHours,
    )
  }

  @Post('/:organizationId/unsuspend')
  @ApiOperation({
    summary: 'Unsuspend organization',
    operationId: 'unsuspendOrganization',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Organization unsuspended successfully',
  })
  @AuthStrategy(AuthStrategyType.API_KEY)
  @RequiredSystemRole(SystemRole.ADMIN)
  @Audit({
    action: AuditAction.UNSUSPEND,
    targetType: AuditTarget.ORGANIZATION,
    targetIdFromRequest: (req) => req.params.organizationId,
  })
  async unsuspend(@Param('organizationId') organizationId: string): Promise<void> {
    return this.organizationService.unsuspend(organizationId)
  }
  @Get('/:organizationId/otel-config')
  @ApiOperation({
    summary: 'Get organization OTEL config by organization ID',
    operationId: 'getOrganizationOtelConfig',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'OTEL Config',
    type: OtelConfigDto,
  })
  @AuthStrategy(AuthStrategyType.API_KEY)
  @UseGuards(OtelCollectorAuthContextGuard)
  async getOtelConfig(@Param('organizationId') organizationId: string): Promise<OtelConfigDto> {
    const otelConfigDto = await this.organizationService.getOtelConfigByOrganizationId(organizationId)
    if (!otelConfigDto) {
      throw new NotFoundException(`Organization OTEL config for organization ${organizationId} not found`)
    }

    return otelConfigDto
  }
  @Put('/:organizationId/otel-config')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Update organization OpenTelemetry configuration',
    operationId: 'updateOrganizationOtelConfig',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID',
    type: 'string',
  })
  @ApiBody({
    type: OtelConfigDto,
    required: true,
  })
  @ApiResponse({
    status: 204,
    description: 'OpenTelemetry configuration updated successfully',
  })
  @UseGuards(OrganizationAuthContextGuard)
  @RequiredOrganizationMemberRole(OrganizationMemberRole.OWNER)
  @Audit({
    action: AuditAction.UPDATE_OTEL_CONFIG,
    targetType: AuditTarget.ORGANIZATION,
    targetIdFromRequest: (req) => req.params.organizationId,
    requestMetadata: {
      body: (req: TypedRequest<OtelConfigDto>) => ({
        endpoint: req.body?.endpoint,
        headerKeys: req.body?.headers ? Object.keys(req.body.headers) : [],
      }),
    },
  })
  async updateOtelConfig(
    @Param('organizationId') organizationId: string,
    @Body() otelConfigDto: OtelConfigDto,
  ): Promise<void> {
    await this.organizationService.updateOtelConfig(organizationId, otelConfigDto)
  }

  @Delete('/:organizationId/otel-config')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete organization OpenTelemetry configuration',
    operationId: 'deleteOrganizationOtelConfig',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'OpenTelemetry configuration deleted successfully',
  })
  @UseGuards(OrganizationAuthContextGuard)
  @RequiredOrganizationMemberRole(OrganizationMemberRole.OWNER)
  @Audit({
    action: AuditAction.DELETE_OTEL_CONFIG,
    targetType: AuditTarget.ORGANIZATION,
    targetIdFromRequest: (req) => req.params.organizationId,
  })
  async deleteOtelConfig(@Param('organizationId') organizationId: string): Promise<void> {
    await this.organizationService.deleteOtelConfig(organizationId)
  }

  @Put('/:organizationId/experimental-config')
  @RequireFlagsEnabled({ flags: [{ flagKey: 'organization_experiments', defaultValue: true }] })
  @ApiOperation({
    summary: 'Update experimental configuration',
    operationId: 'updateExperimentalConfig',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID',
    type: 'string',
  })
  @ApiBody({
    description: 'Experimental configuration as a JSON object. Set to null to clear the configuration.',
    required: false,
    schema: {
      additionalProperties: true,
      example: {
        otel: {
          endpoint: 'http://otel-collector:4317',
          headers: {
            'api-key': 'XXX',
          },
        },
      },
    },
  })
  @UseGuards(OrganizationAuthContextGuard)
  @RequiredOrganizationMemberRole(OrganizationMemberRole.OWNER)
  async updateExperimentalConfig(
    @Param('organizationId') organizationId: string,
    @Body() experimentalConfig: Record<string, any> | null,
  ): Promise<void> {
    await this.organizationService.updateExperimentalConfig(organizationId, experimentalConfig)
  }
}
