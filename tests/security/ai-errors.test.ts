import { describe, expect, it } from "vitest"

import { toUserFacingAiError } from "@/lib/ai-errors"

describe("ai-errors security", () => {
  it("hides internal Ollama connection errors from users", () => {
    const message = toUserFacingAiError(
      new Error("fetch failed ECONNREFUSED 192.168.10.244:11434")
    )

    expect(message).not.toContain("192.168")
    expect(message).not.toContain("ECONNREFUSED")
    expect(message).toContain("unavailable")
  })

  it("preserves user-facing validation messages", () => {
    const message = toUserFacingAiError(
      new Error("Only PDF files are allowed.")
    )

    expect(message).toBe("Only PDF files are allowed.")
  })

  it("documents gap: short HTTP errors may leak to users", () => {
    const message = toUserFacingAiError(new Error("HTTP 502 Bad Gateway"))

    // Known gap: messages under 120 chars without technical keywords pass through.
    expect(message).toBe("HTTP 502 Bad Gateway")
  })

  it("documents gap: short stack-like messages may pass through", () => {
    const message = toUserFacingAiError(new Error("at Object.<anonymous>"))

    expect(message).toBe("at Object.<anonymous>")
  })
})
