import { composePlugins, withNx } from '@nx/next'

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  // Standalone output for the Docker image (see apps/web/Dockerfile).
  output: 'standalone',
}

const plugins = [withNx]

export default composePlugins(...plugins)(nextConfig)
