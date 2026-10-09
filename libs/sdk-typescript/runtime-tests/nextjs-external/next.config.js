// Copyright TemplateOrg.
// SPDX-License-Identifier: Apache-2.0

// Externalize the SDK and its sibling client packages so Next.js does NOT
// bundle them via webpack. Node loads them as ESM at runtime, which is the
// failure mode reported in issue #4771.
module.exports = {
  serverExternalPackages: ['@template-slim/sdk', '@template-slim/api-client', '@template-slim/toolbox-api-client'],
}
