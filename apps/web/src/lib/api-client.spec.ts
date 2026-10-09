/**
 * @jest-environment node
 */
import { getApiUrl } from './api-client'

describe('getApiUrl', () => {
  const env = process.env

  beforeEach(() => {
    process.env = { ...env }
    delete process.env.API_URL
    delete process.env.NEXT_PUBLIC_API_URL
  })

  afterAll(() => {
    process.env = env
  })

  it('falls back to local API default', () => {
    expect(getApiUrl()).toBe('http://localhost:3001')
  })

  it('prefers API_URL on the server', () => {
    process.env.API_URL = 'http://api:3001'
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001'
    expect(getApiUrl()).toBe('http://api:3001')
  })

  it('uses NEXT_PUBLIC_API_URL when API_URL is unset', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com'
    expect(getApiUrl()).toBe('https://api.example.com')
  })
})
