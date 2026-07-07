import { describe, expect, it } from "vitest"

import {
  AI_HOURLY_LIMIT,
  AI_RATE_LIMIT_WINDOW_MS,
  checkAiRateLimit,
  checkRateLimit,
  getClientIp,
} from "@/lib/rate-limit"

describe("rate-limit", () => {
  it("blocks requests after the limit is reached", () => {
    const key = `test-block-${Date.now()}`

    for (let i = 0; i < 3; i++) {
      const result = checkRateLimit(key, { limit: 3, windowMs: 60_000 })
      expect(result.allowed).toBe(true)
    }

    const blocked = checkRateLimit(key, { limit: 3, windowMs: 60_000 })
    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
  })

  it("shares one hourly pool across all AI endpoints per IP", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": `ai-pool-${Date.now()}` },
    })

    for (let i = 0; i < AI_HOURLY_LIMIT; i++) {
      const result = checkAiRateLimit(request)
      expect(result.allowed).toBe(true)
      expect(result.limit).toBe(AI_HOURLY_LIMIT)
    }

    const blocked = checkAiRateLimit(request)
    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
    expect(blocked.resetAt).toBeGreaterThan(Date.now())
    expect(blocked.resetAt - Date.now()).toBeLessThanOrEqual(
      AI_RATE_LIMIT_WINDOW_MS
    )
  })

  it("uses x-forwarded-for first IP when present", () => {
    const request = new Request("https://example.com", {
      headers: {
        "x-forwarded-for": "203.0.113.5, 10.0.0.1",
        "x-real-ip": "10.0.0.2",
      },
    })

    expect(getClientIp(request)).toBe("203.0.113.5")
  })

  it("documents IP spoofing risk: forwarded header is trusted without proxy validation", () => {
    const spoofed = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.2.3.4" },
    })

    expect(getClientIp(spoofed)).toBe("1.2.3.4")
  })
})
