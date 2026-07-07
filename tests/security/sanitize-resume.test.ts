import { describe, expect, it } from "vitest"

import {
  sanitizeHttpsUrl,
  sanitizePhotoDataUrl,
} from "@/lib/security/sanitize-resume"

describe("sanitize resume input", () => {
  it("allows https URLs only", () => {
    expect(sanitizeHttpsUrl("https://example.com/portfolio")).toBe(
      "https://example.com/portfolio"
    )
    expect(sanitizeHttpsUrl("http://example.com")).toBe("")
    expect(sanitizeHttpsUrl("javascript:alert(1)")).toBe("")
  })

  it("allows only image data URLs within size limits", () => {
    const valid =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    expect(sanitizePhotoDataUrl(valid)).toBe(valid)
    expect(sanitizePhotoDataUrl("data:text/html;base64,abc")).toBeNull()
    expect(sanitizePhotoDataUrl("https://evil.com/a.png")).toBeNull()
  })
})
