/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

import { TemplateSlimClient } from './client'

describe('TemplateSlimClient', () => {
  it('requires apiUrl', () => {
    expect(() => new TemplateSlimClient({ apiUrl: '  ' })).toThrow('apiUrl is required')
  })

  it('returns health payload', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'ok' }),
    })
    global.fetch = fetchMock as unknown as typeof fetch

    const client = new TemplateSlimClient({ apiUrl: 'http://localhost:3001', apiKey: 'k' })
    await expect(client.health()).resolves.toEqual({ status: 'ok' })
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/health',
      expect.objectContaining({ headers: { Authorization: 'Bearer k' } }),
    )
  })

  it('throws on non-ok health', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 }) as unknown as typeof fetch
    const client = new TemplateSlimClient({ apiUrl: 'http://localhost:3001' })
    await expect(client.health()).rejects.toThrow('503')
  })
})
