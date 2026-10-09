# TemplateSlim TypeScript SDK (skeleton)

Example TypeScript SDK for template-slim. Copy this library to start a typed
client for your own API.

## Installation

```bash
npm install @template-slim/sdk
```

## Quick Start

```ts
import { TemplateSlimClient } from '@template-slim/sdk'

const client = new TemplateSlimClient({
  apiUrl: 'http://localhost:3001',
  apiKey: 'your-api-key',
})

console.log(await client.health())
```

## Extending

Add one method per API resource in `src/client.ts`, backed by
`@template-slim/api-client` (generated from the NestJS OpenAPI spec via
`yarn generate:api-client`). Keep every method covered by a jest spec — see
`src/client.spec.ts`.
