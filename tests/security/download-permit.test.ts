import { describe, expect, it } from "vitest"

import {
  createDownloadPermit,
  verifyDownloadPermit,
} from "@/lib/security/download-permit"

describe("download permit", () => {
  it("creates and verifies a signed permit", () => {
    const permit = createDownloadPermit("01712345678", "Jane Doe")
    const payload = verifyDownloadPermit(permit)

    expect(payload).not.toBeNull()
    expect(payload?.phone).toBe("01712345678")
    expect(payload?.fullName).toBe("Jane Doe")
  })

  it("rejects tampered permits", () => {
    const permit = createDownloadPermit("01712345678", "Jane Doe")
    const tampered = `${permit}x`
    expect(verifyDownloadPermit(tampered)).toBeNull()
  })
})
