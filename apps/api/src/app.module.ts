/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module, NestModule, MiddlewareConsumer, RequestMethod, ExecutionContext } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { GlobalAuthGuard } from './auth/global-auth.guard'
import { SystemActionGuard } from './user/guards/system-action.guard'
import { VersionHeaderMiddleware } from './common/middleware/version-header.middleware'
import { FailedAuthRateLimitMiddleware } from './common/middleware/failed-auth-rate-limit.middleware'
import { AppService } from './app.service'
import { UserModule } from './user/user.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { join } from 'path'
import { ApiKeyModule } from './api-key/api-key.module'
import { seconds, ThrottlerModule } from '@nestjs/throttler'
import { RedisModule, getRedisConnectionToken } from '@nestjs-modules/ioredis'
import { ScheduleModule } from '@nestjs/schedule'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { OrganizationModule } from './organization/organization.module'
import { TypedConfigService } from './config/typed-config.service'
import { TypedConfigModule } from './config/typed-config.module'
import { CustomNamingStrategy } from './common/utils/naming-strategy.util'
import { MaintenanceMiddleware } from './common/middleware/maintenance.middleware'
import { AuditModule } from './audit/audit.module'
import { HealthModule } from './health/health.module'
import { HelloModule } from './hello/hello.module'
import { OpenFeatureModule } from '@openfeature/nestjs-sdk'
import { OpenFeaturePostHogProvider } from './common/providers/openfeature-posthog.provider'
import { LoggerModule } from 'nestjs-pino'
import { getPinoTransport, swapMessageAndObject } from './common/utils/pino.util'
import { Redis } from 'ioredis'
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis'
import { BodyParserErrorModule } from './common/modules/body-parser-error.module'

@Module({
  imports: [
    LoggerModule.forRootAsync({
      useFactory: (configService: TypedConfigService) => {
        const logConfig = configService.get('log')
        const isProduction = configService.get('production')
        return {
          pinoHttp: {
            autoLogging: logConfig.requests.enabled,
            level: logConfig.level,
            hooks: {
              logMethod: swapMessageAndObject,
            },
            quietReqLogger: true,
            transport: getPinoTransport(isProduction, logConfig),
          },
        }
      },
      inject: [TypedConfigService],
    }),
    TypedConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [TypedConfigService],
      useFactory: (configService: TypedConfigService) => {
        return {
          type: 'postgres',
          host: configService.getOrThrow('database.host'),
          port: configService.getOrThrow('database.port'),
          username: configService.getOrThrow('database.username'),
          password: configService.getOrThrow('database.password'),
          database: configService.getOrThrow('database.database'),
          autoLoadEntities: true,
          migrations: [join(__dirname, 'migrations/**/*-migration.{ts,js}')],
          migrationsRun: configService.get('runMigrations') || !configService.getOrThrow('production'),
          namingStrategy: new CustomNamingStrategy(),
          manualInitialization: configService.get('skipConnections'),
          ssl: configService.get('database.tls.enabled')
            ? {
                rejectUnauthorized: configService.get('database.tls.rejectUnauthorized'),
              }
            : undefined,
          extra: {
            max: configService.get('database.pool.max'),
            min: configService.get('database.pool.min'),
            idleTimeoutMillis: configService.get('database.pool.idleTimeoutMillis'),
            connectionTimeoutMillis: configService.get('database.pool.connectionTimeoutMillis'),
          },
          cache: {
            type: 'ioredis',
            ignoreErrors: true,
            options: configService.getRedisConfig({ keyPrefix: 'typeorm:' }),
          },
          entitySkipConstructor: true,
        }
      },
    }),
    BodyParserErrorModule,
    RedisModule.forRootAsync({
      inject: [TypedConfigService],
      useFactory: (configService: TypedConfigService) => ({
        type: 'single',
        options: configService.getRedisConfig(),
      }),
    }),
    RedisModule.forRootAsync(
      {
        inject: [TypedConfigService],
        useFactory: (configService: TypedConfigService) => ({
          type: 'single',
          options: configService.getRedisConfig({ db: 1 }),
        }),
      },
      'throttler',
    ),
    ThrottlerModule.forRootAsync({
      useFactory: async (redis: Redis, configService: TypedConfigService) => {
        const rateLimit = configService.get('rateLimit')
        const throttlers = [
          { name: 'anonymous', config: rateLimit.anonymous },
          { name: 'failed-auth', config: rateLimit.failedAuth },
          { name: 'authenticated', config: rateLimit.authenticated },
        ]
          .filter(({ config }) => config.ttl !== undefined && config.limit !== undefined)
          .map(({ name, config }) => ({
            name,
            ttl: seconds(config.ttl),
            limit: config.limit,
          }))

        return {
          throttlers,
          storage: new ThrottlerStorageRedisService(redis),
        }
      },
      inject: [getRedisConnectionToken('throttler'), TypedConfigService],
    }),
    EventEmitterModule.forRoot({
      maxListeners: 100,
    }),
    ApiKeyModule,
    AuthModule,
    UserModule,
    ScheduleModule.forRoot(),
    OrganizationModule,
    AuditModule,
    HealthModule,
    HelloModule,
    OpenFeatureModule.forRoot({
      contextFactory: (request: ExecutionContext) => {
        const req = request.switchToHttp().getRequest()

        return {
          targetingKey: req.user?.userId,
          organizationId: req.user?.organizationId,
        }
      },
      defaultProvider: new OpenFeaturePostHogProvider({
        clientOptions: {
          host: process.env.POSTHOG_HOST,
        },
        apiKey: process.env.POSTHOG_API_KEY,
      }),
    }),
  ],
  controllers: [],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: GlobalAuthGuard },
    { provide: APP_GUARD, useClass: SystemActionGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VersionHeaderMiddleware).forRoutes({ path: '{*path}', method: RequestMethod.ALL })
    consumer.apply(FailedAuthRateLimitMiddleware).forRoutes({ path: '{*path}', method: RequestMethod.ALL })
    consumer.apply(MaintenanceMiddleware).forRoutes({ path: '{*path}', method: RequestMethod.ALL })
  }
}
