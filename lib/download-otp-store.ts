type OtpEntry = {
  code: string
  expiresAt: number
  fullName: string
}

const OTP_TTL_MS = 5 * 60 * 1000

const globalForOtp = globalThis as typeof globalThis & {
  downloadOtpStore?: Map<string, OtpEntry>
}

function getStore() {
  if (!globalForOtp.downloadOtpStore) {
    globalForOtp.downloadOtpStore = new Map()
  }
  return globalForOtp.downloadOtpStore
}

export function normalizePhoneNumber(phone: string) {
  return phone.replace(/\D/g, "")
}

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function createDownloadOtp(phoneNumber: string, fullName: string) {
  const key = normalizePhoneNumber(phoneNumber)
  if (!key) throw new Error("Invalid phone number")

  const code = generateOtpCode()
  getStore().set(key, {
    code,
    fullName,
    expiresAt: Date.now() + OTP_TTL_MS,
  })

  return code
}

export function verifyDownloadOtp(phoneNumber: string, otp: string) {
  const key = normalizePhoneNumber(phoneNumber)
  const entry = getStore().get(key)

  if (!entry) return { ok: false as const, error: "No code found. Request a new one." }
  if (Date.now() > entry.expiresAt) {
    getStore().delete(key)
    return { ok: false as const, error: "Code expired. Request a new one." }
  }
  if (entry.code !== otp.trim()) {
    return { ok: false as const, error: "Invalid code. Try again." }
  }

  getStore().delete(key)
  return { ok: true as const, fullName: entry.fullName }
}
