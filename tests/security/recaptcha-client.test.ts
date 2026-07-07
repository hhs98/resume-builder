import { describe, expect, it, vi } from "vitest"

import { verifyRecaptchaOnClient } from "@/lib/recaptcha-client"

describe("verifyRecaptchaOnClient", () => {
  it("uses the provider-compatible v3 action", async () => {
    const executeV3 = vi.fn(async (action: string) => {
      expect(action).toBe("example")
      return "token-123"
    })

    await expect(verifyRecaptchaOnClient(() => executeV3)).resolves.toBe(
      "token-123"
    )
  })

  it("waits until executeV3 becomes available", async () => {
    let executeV3: ((action: string) => Promise<string>) | undefined

    const pending = verifyRecaptchaOnClient(() => executeV3)

    setTimeout(() => {
      executeV3 = async () => "late-token"
    }, 250)

    await expect(pending).resolves.toBe("late-token")
  })
})
