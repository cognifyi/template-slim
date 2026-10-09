/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

const configuration = {
  production: process.env.NODE_ENV === 'production',
  version: process.env.VERSION || '0.0.0-dev',
  environment: process.env.ENVIRONMENT,
  runMigrations: process.env.RUN_MIGRATIONS === 'true',
  port: parseInt(process.env.PORT || '3001', 10),
  appUrl: process.env.APP_URL,
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    tls: {
      enabled: process.env.DB_TLS_ENABLED === 'true',
      rejectUnauthorized: process.env.DB_TLS_REJECT_UNAUTHORIZED !== 'false',
    },
    pool: {
      max: process.env.DB_POOL_MAX && parseInt(process.env.DB_POOL_MAX, 10),
      min: process.env.DB_POOL_MIN && parseInt(process.env.DB_POOL_MIN, 10),
      idleTimeoutMillis: process.env.DB_POOL_IDLE_TIMEOUT_MS && parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS, 10),
      connectionTimeoutMillis:
        process.env.DB_POOL_CONNECTION_TIMEOUT_MS && parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT_MS, 10),
    },
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  },
  posthog: {
    apiKey: process.env.POSTHOG_API_KEY,
    host: process.env.POSTHOG_HOST,
    environment: process.env.POSTHOG_ENVIRONMENT,
  },
  oidc: {
    clientId: process.env.OIDC_CLIENT_ID || process.env.OID_CLIENT_ID,
    issuer: process.env.OIDC_ISSUER_BASE_URL || process.env.OID_ISSUER_BASE_URL,
    publicIssuer: process.env.PUBLIC_OIDC_DOMAIN,
    audience: process.env.OIDC_AUDIENCE || process.env.OID_AUDIENCE,
    managementApi: {
      enabled: process.env.OIDC_MANAGEMENT_API_ENABLED === 'true',
      clientId: process.env.OIDC_MANAGEMENT_API_CLIENT_ID,
      clientSecret: process.env.OIDC_MANAGEMENT_API_CLIENT_SECRET,
      audience: process.env.OIDC_MANAGEMENT_API_AUDIENCE,
    },
  },
  proxy: {
    domain: process.env.PROXY_DOMAIN,
    protocol: process.env.PROXY_PROTOCOL,
    apiKey: process.env.PROXY_API_KEY,
    templateUrl: process.env.PROXY_TEMPLATE_URL,
  },
  audit: {
    toolboxRequestsEnabled: process.env.AUDIT_TOOLBOX_REQUESTS_ENABLED === 'true',
    retentionDays: process.env.AUDIT_LOG_RETENTION_DAYS
      ? parseInt(process.env.AUDIT_LOG_RETENTION_DAYS, 10)
      : undefined,
    consoleLogEnabled: process.env.AUDIT_CONSOLE_LOG_ENABLED === 'true',
    publish: {
      enabled: process.env.AUDIT_PUBLISH_ENABLED === 'true',
      batchSize: process.env.AUDIT_PUBLISH_BATCH_SIZE ? parseInt(process.env.AUDIT_PUBLISH_BATCH_SIZE, 10) : 1000,
      mode: (process.env.AUDIT_PUBLISH_MODE || 'direct') as 'direct' | 'kafka',
      storageAdapter: process.env.AUDIT_PUBLISH_STORAGE_ADAPTER || 'opensearch',
      opensearchIndexName: process.env.AUDIT_PUBLISH_OPENSEARCH_INDEX_NAME || 'audit-logs',
    },
  },
  kafka: {
    enabled: process.env.KAFKA_ENABLED === 'true',
    brokers: process.env.KAFKA_BROKERS || 'localhost:9092',
    clientId: process.env.KAFKA_CLIENT_ID,
    sasl: {
      mechanism: process.env.KAFKA_SASL_MECHANISM,
      username: process.env.KAFKA_SASL_USERNAME,
      password: process.env.KAFKA_SASL_PASSWORD,
    },
    tls: {
      enabled: process.env.KAFKA_TLS_ENABLED === 'true',
      rejectUnauthorized: process.env.KAFKA_TLS_REJECT_UNAUTHORIZED !== 'false',
    },
  },
  opensearch: {
    nodes: process.env.OPENSEARCH_NODES || 'https://localhost:9200',
    username: process.env.OPENSEARCH_USERNAME,
    password: process.env.OPENSEARCH_PASSWORD,
    aws: {
      roleArn: process.env.OPENSEARCH_AWS_ROLE_ARN,
      region: process.env.OPENSEARCH_AWS_REGION,
    },
    tls: {
      rejectUnauthorized: process.env.OPENSEARCH_TLS_REJECT_UNAUTHORIZED !== 'false',
    },
  },
  healthCheck: {
    apiKey: process.env.HEALTH_CHECK_API_KEY,
  },
  sshGateway: {
    apiKey: process.env.SSH_GATEWAY_API_KEY,
    command: process.env.SSH_GATEWAY_COMMAND,
    publicKey: process.env.SSH_GATEWAY_PUBLIC_KEY,
    url: process.env.SSH_GATEWAY_URL,
  },
  rateLimit: {
    anonymous: {
      ttl: process.env.RATE_LIMIT_ANONYMOUS_TTL ? parseInt(process.env.RATE_LIMIT_ANONYMOUS_TTL, 10) : undefined,
      limit: process.env.RATE_LIMIT_ANONYMOUS_LIMIT ? parseInt(process.env.RATE_LIMIT_ANONYMOUS_LIMIT, 10) : undefined,
    },
    failedAuth: {
      ttl: process.env.RATE_LIMIT_FAILED_AUTH_TTL ? parseInt(process.env.RATE_LIMIT_FAILED_AUTH_TTL, 10) : undefined,
      limit: process.env.RATE_LIMIT_FAILED_AUTH_LIMIT
        ? parseInt(process.env.RATE_LIMIT_FAILED_AUTH_LIMIT, 10)
        : undefined,
    },
    authenticated: {
      ttl: process.env.RATE_LIMIT_AUTHENTICATED_TTL
        ? parseInt(process.env.RATE_LIMIT_AUTHENTICATED_TTL, 10)
        : undefined,
      limit: process.env.RATE_LIMIT_AUTHENTICATED_LIMIT
        ? parseInt(process.env.RATE_LIMIT_AUTHENTICATED_LIMIT, 10)
        : undefined,
    },
  },
  log: {
    console: {
      disabled: process.env.LOG_CONSOLE_DISABLED === 'true',
    },
    level: process.env.LOG_LEVEL || 'info',
    requests: {
      enabled: process.env.LOG_REQUESTS_ENABLED === 'true',
    },
  },
  defaultOrganizationQuota: {    totalCpuQuota: parseInt(process.env.DEFAULT_ORG_QUOTA_TOTAL_CPU_QUOTA || '10', 10),
    totalMemoryQuota: parseInt(process.env.DEFAULT_ORG_QUOTA_TOTAL_MEMORY_QUOTA || '10', 10),
    totalDiskQuota: parseInt(process.env.DEFAULT_ORG_QUOTA_TOTAL_DISK_QUOTA || '30', 10),
    maxCpuPerSandbox: parseInt(process.env.DEFAULT_ORG_QUOTA_MAX_CPU_PER_SANDBOX || '4', 10),
    maxMemoryPerSandbox: parseInt(process.env.DEFAULT_ORG_QUOTA_MAX_MEMORY_PER_SANDBOX || '8', 10),
    maxDiskPerSandbox: parseInt(process.env.DEFAULT_ORG_QUOTA_MAX_DISK_PER_SANDBOX || '10', 10),
    snapshotQuota: parseInt(process.env.DEFAULT_ORG_QUOTA_SNAPSHOT_QUOTA || '30', 10),
    maxSnapshotSize: parseInt(process.env.DEFAULT_ORG_QUOTA_MAX_SNAPSHOT_SIZE || '20', 10),
    volumeQuota: parseInt(process.env.DEFAULT_ORG_QUOTA_VOLUME_QUOTA || '100', 10),
  },
  admin: {
    apiKey: process.env.ADMIN_API_KEY,
  },
  // Kept for historical migrations that backfill organization.defaultRegion.
  // New code should not rely on regions.
  defaultRegion: {
    id: process.env.DEFAULT_REGION_ID || 'us',
    name: process.env.DEFAULT_REGION_NAME || 'us',
  },
  skipUserEmailVerification: process.env.SKIP_USER_EMAIL_VERIFICATION === 'true',
  apiKey: {
    validationCacheTtlSeconds: parseInt(process.env.API_KEY_VALIDATION_CACHE_TTL_SECONDS || '10', 10),
    userCacheTtlSeconds: parseInt(process.env.API_KEY_USER_CACHE_TTL_SECONDS || '60', 10),
  },
  otelCollector: {
    endpointUrl: process.env.OTEL_COLLECTOR_ENDPOINT_URL,
    apiKey: process.env.OTEL_COLLECTOR_API_KEY,
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY,
    salt: process.env.ENCRYPTION_SALT,
  },
  maintananceMode: process.env.MAINTENANCE_MODE === 'true',
  disableCronJobs: process.env.DISABLE_CRON_JOBS === 'true',
  skipConnections: process.env.SKIP_CONNECTIONS === 'true',
}

export { configuration }
