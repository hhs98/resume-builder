import { describe, expect, it } from "vitest"

import { isPdfBuffer } from "@/lib/security/pdf-validation"

describe("pdf magic bytes", () => {
  it("accepts valid PDF headers", () => {
    const buffer = new TextEncoder().encode("%PDF-1.4\n").buffer
    expect(isPdfBuffer(buffer)).toBe(true)
  })

  it("rejects non-pdf content", () => {
    const buffer = new TextEncoder().encode("not a pdf").buffer
    expect(isPdfBuffer(buffer)).toBe(false)
  })
})
