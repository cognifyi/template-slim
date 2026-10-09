/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  apps: [
    {
      name: 'daytona',
      script: './dist/apps/api/main.js',
      instances: 4,
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PM2_CLUSTER: 'true',
      },
      wait_ready: true,
      kill_timeout: 30000,
      listen_timeout: 10000,
    },
  ],
}
