// Resolves the NestJS API base URL in every runtime:
// - browser: NEXT_PUBLIC_API_URL (baked at build time) or same-origin fallback
// - server (SSR/RSC): API_URL, else NEXT_PUBLIC_API_URL, else local dev default
// - containers: set API_URL=http://api:3001 (or the compose service name)
export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  }
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
}
