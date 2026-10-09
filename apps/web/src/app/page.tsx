import { getApiUrl } from '../lib/api-client'

export const dynamic = 'force-dynamic'

async function getHello(): Promise<{ message: string; version: string } | null> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/hello`, { cache: 'no-store' })
    if (!res.ok) {
      return null
    }
    return res.json()
  } catch {
    return null
  }
}

export default async function Index() {
  const hello = await getHello()

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '3rem', maxWidth: '720px', margin: '0 auto' }}>
      <h1>TemplateSlim Web</h1>
      <p>
        Next.js frontend served on <code>:3000</code>, talking to the NestJS API on <code>:3001</code>.
      </p>
      <section style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>API status</h2>
        {hello ? (
          <p>
            ✅ <code>{hello.message}</code> (version <code>{hello.version}</code>)
          </p>
        ) : (
          <p>
            ⚠️ API unreachable at <code>{getApiUrl()}/api/v1/hello</code>. Start it with{' '}
            <code>npx nx serve api</code>.
          </p>
        )}
      </section>
      <section style={{ marginTop: '2rem' }}>
        <h2>Health</h2>
        <p>
          Web health endpoint: <a href="/health">/health</a>
        </p>
      </section>
    </main>
  )
}
