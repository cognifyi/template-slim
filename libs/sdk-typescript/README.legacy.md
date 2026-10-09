# @template-org/sdk is now @template-slim/sdk

> **This package has been renamed.** Please use [`@template-slim/sdk`](https://www.npmjs.com/package/@template-slim/sdk) instead.

## Migration

Update your dependency:

```bash
npm uninstall @template-org/sdk
npm install @template-slim/sdk
```

or with yarn:

```bash
yarn remove @template-org/sdk
yarn add @template-slim/sdk
```

Then update your imports:

```diff
- import { Daytona } from '@template-org/sdk'
+ import { Daytona } from '@template-slim/sdk'
```

The API is identical — only the package name has changed.

## About @template-slim/sdk

The official TypeScript SDK for [Daytona](https://daytona.io), secure and elastic infrastructure for running AI-generated code.

For documentation, examples, and guides, visit [daytona.io/docs](https://www.daytona.io/docs/en/typescript-sdk/).
