import { expect, test } from '@playwright/test'

const apiBase = process.env.API_BASE_URL || 'http://localhost:3001'

test.describe('web', () => {
  test('home renders and shows live API greeting', async ({ page }) => {
    const res = await page.goto('/')
    expect(res?.status()).toBe(200)
    await expect(page.getByRole('heading', { name: 'TemplateSlim Web' })).toBeVisible()
    // Page server-renders the greeting straight from the NestJS API.
    await expect(page.getByText('Hello from TemplateSlim')).toBeVisible()
  })

  test('GET /health returns ok', async ({ request }) => {
    const res = await request.get('/health')
    expect(res.status()).toBe(200)
    expect(await res.json()).toMatchObject({ status: 'ok', service: 'web' })
  })
})

test.describe('api', () => {
  test('GET /api/health returns ok', async ({ request }) => {
    const res = await request.get(`${apiBase}/api/health`)
    expect(res.status()).toBe(200)
    expect(await res.json()).toMatchObject({ status: 'ok' })
  })

  test('GET /api/v1/hello is public', async ({ request }) => {
    const res = await request.get(`${apiBase}/api/v1/hello`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.message).toContain('Hello from TemplateSlim')
  })

  test('GET /api/v1/hello/secure requires a key', async ({ request }) => {
    const res = await request.get(`${apiBase}/api/v1/hello/secure`)
    expect(res.status()).toBe(401)
  })
})
