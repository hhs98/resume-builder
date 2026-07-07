type RateLimitEntry = {
  count: number
  resetAt: number
}

export type RateLimitOptions = {
  limit?: number
  windowMs?: number
}

export type RateLimitResult = {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: number
}

export const AI_HOURLY_LIMIT = 5
export const AI_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
export const AI_RATE_LIMIT_ERROR =
  "AI request limit reached. You can make up to 5 AI requests per hour from this network."

const store = new Map<string, RateLimitEntry>()

function pruneExpiredEntries(now: number) {
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) {
      store.delete(key)
    }
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }

  const realIp = request.headers.get("x-real-ip")?.trim()
  if (realIp) return realIp

  const cfConnectingIp = request.headers.get("cf-connecting-ip")?.trim()
  if (cfConnectingIp) return cfConnectingIp

  return "unknown"
}

export function checkAiRateLimit(request: Request): RateLimitResult {
  return checkRateLimit(`ai:${getClientIp(request)}`, {
    limit: AI_HOURLY_LIMIT,
    windowMs: AI_RATE_LIMIT_WINDOW_MS,
  })
}

export function checkRateLimit(
  key: string,
  { limit = 5, windowMs = 60 * 60 * 1000 }: RateLimitOptions = {}
): RateLimitResult {
  const now = Date.now()

  if (store.size > 1_000) {
    pruneExpiredEntries(now)
  }

  const current = store.get(key)

  if (!current || now >= current.resetAt) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return {
      allowed: true,
      limit,
      remaining: Math.max(limit - 1, 0),
      resetAt,
    }
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: current.resetAt,
    }
  }

  current.count += 1
  store.set(key, current)

  return {
    allowed: true,
    limit,
    remaining: Math.max(limit - current.count, 0),
    resetAt: current.resetAt,
  }
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  const retryAfterSeconds = Math.max(
    Math.ceil((result.resetAt - Date.now()) / 1000),
    0
  )

  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    "Retry-After": String(retryAfterSeconds),
  }
}
