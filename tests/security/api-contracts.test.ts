import { describe, expect, it } from "vitest"

import {
  createDownloadPermit,
  verifyDownloadPermit,
} from "@/lib/security/download-permit"
import { sanitizeHttpsUrl } from "@/lib/security/sanitize-resume"
import { isPdfBuffer } from "@/lib/security/pdf-validation"

describe("security hardening contracts", () => {
  it("issues signed download permits after OTP verification flow", () => {
    const permit = createDownloadPermit("01700000000", "Test User")
    expect(verifyDownloadPermit(permit)).not.toBeNull()
  })

  it("blocks javascript URLs in project links", () => {
    expect(sanitizeHttpsUrl("javascript:alert(1)")).toBe("")
  })

  it("validates PDF magic bytes", () => {
    const pdf = new TextEncoder().encode("%PDF-1.7").buffer
    const fake = new TextEncoder().encode("FAKE").buffer
    expect(isPdfBuffer(pdf)).toBe(true)
    expect(isPdfBuffer(fake)).toBe(false)
  })
})
