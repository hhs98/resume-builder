import { NextResponse } from "next/server"

import {
  checkRateLimit,
  getClientIp,
  rateLimitHeaders,
  type RateLimitOptions,
} from "@/lib/rate-limit"

export function enforceRateLimit(
  request: Request,
  keyPrefix: string,
  options?: RateLimitOptions,
  errorMessage = "Too many requests. Please try again later."
): NextResponse | null {
  const clientIp = getClientIp(request)
  const result = checkRateLimit(`${keyPrefix}:${clientIp}`, options)

  if (!result.allowed) {
    return NextResponse.json(
      { error: errorMessage },
      { status: 429, headers: rateLimitHeaders(result) }
    )
  }

  return null
}
