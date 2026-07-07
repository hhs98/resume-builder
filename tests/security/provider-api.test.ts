import { describe, expect, it } from "vitest"

import { formatProviderError } from "@/lib/provider-api"

describe("formatProviderError", () => {
  it("reads nested provider errors arrays", () => {
    expect(
      formatProviderError(
        {
          errors: [["Error verifying reCAPTCHA, please try again."]],
        },
        "fallback"
      )
    ).toBe("Error verifying reCAPTCHA, please try again.")
  })

  it("prefers message and error fields when present", () => {
    expect(formatProviderError({ message: "OTP record not found." }, "fallback")).toBe(
      "OTP record not found."
    )
  })
})
