import { createHmac, timingSafeEqual } from "node:crypto"

const PERMIT_TTL_MS = 15 * 60 * 1000

export type DownloadPermitPayload = {
  phone: string
  fullName: string
  exp: number
}

function getPermitSecret(): string {
  const secret = process.env.DOWNLOAD_PERMIT_SECRET?.trim()
  if (secret) return secret

  if (process.env.NODE_ENV === "production") {
    throw new Error("DOWNLOAD_PERMIT_SECRET is required in production.")
  }

  return "dev-download-permit-secret-change-me"
}

export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "")
}

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export function createDownloadPermit(
  phone: string,
  fullName: string
): string {
  const payload: DownloadPermitPayload = {
    phone: normalizePhoneNumber(phone),
    fullName: fullName.trim(),
    exp: Date.now() + PERMIT_TTL_MS,
  }

  const data = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = createHmac("sha256", getPermitSecret())
    .update(data)
    .digest("base64url")

  return `${data}.${signature}`
}

export function verifyDownloadPermit(
  permit: string
): DownloadPermitPayload | null {
  const [data, signature] = permit.split(".")
  if (!data || !signature) return null

  const expected = createHmac("sha256", getPermitSecret())
    .update(data)
    .digest("base64url")

  if (!safeCompare(signature, expected)) return null

  try {
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8")
    ) as DownloadPermitPayload

    if (
      !payload.phone ||
      !payload.fullName ||
      typeof payload.exp !== "number" ||
      payload.exp < Date.now()
    ) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export function getDownloadPermitFromRequest(req: Request): string | null {
  const authorization = req.headers.get("authorization")
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim() || null
  }

  return req.headers.get("x-download-permit")?.trim() || null
}

export function requireDownloadPermit(req: Request): DownloadPermitPayload | null {
  const token = getDownloadPermitFromRequest(req)
  if (!token) return null
  return verifyDownloadPermit(token)
}
