/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ClientConfig {
  /** Base URL of the API, e.g. http://localhost:3001. */
  apiUrl: string
  /** Bearer token. Optional for public endpoints. */
  apiKey?: string
}

export interface HealthResponse {
  status: string
}

/**
 * Minimal API client skeleton. Add one method per API resource here, backed
 * by `@template-slim/api-client` (generated from the NestJS OpenAPI spec via
 * `yarn generate:api-client`).
 */
export class TemplateSlimClient {
  private readonly baseUrl: string
  private readonly apiKey?: string

  constructor(config: ClientConfig) {
    if (!config.apiUrl?.trim()) {
      throw new Error('apiUrl is required')
    }
    this.baseUrl = config.apiUrl.replace(/\/+$/, '')
    this.apiKey = config.apiKey
  }

  async health(signal?: AbortSignal): Promise<HealthResponse> {
    const res = await fetch(`${this.baseUrl}/api/health`, {
      headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : undefined,
      signal,
    })
    if (!res.ok) {
      throw new Error(`health returned status ${res.status}`)
    }
    return (await res.json()) as HealthResponse
  }
}
