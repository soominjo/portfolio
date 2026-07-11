interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory only — resets on cold start and isn't shared across concurrent
// serverless instances. It raises the bar against casual scripted abuse
// without needing an external store; it is not a hard distributed guarantee.
const hits = new Map<string, RateLimitEntry>()

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }

  entry.count += 1
  return entry.count > limit
}

export function getClientIp(req: { headers: Record<string, string | string[] | undefined> }): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim()
  if (Array.isArray(forwarded)) return forwarded[0]
  return 'unknown'
}
