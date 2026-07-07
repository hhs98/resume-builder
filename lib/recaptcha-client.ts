// Job Media provider expects this v3 action name.
const RECAPTCHA_DOWNLOAD_ACTION = "example"

type ExecuteRecaptchaV3 = (action: string) => Promise<string>

const RECAPTCHA_READY_TIMEOUT_MS = 10_000
const RECAPTCHA_READY_POLL_MS = 150

export async function verifyRecaptchaOnClient(
  getExecuteV3: () => ExecuteRecaptchaV3 | undefined
): Promise<string> {
  const started = Date.now()

  while (Date.now() - started < RECAPTCHA_READY_TIMEOUT_MS) {
    const executeV3 = getExecuteV3()

    if (executeV3) {
      const token = (await executeV3(RECAPTCHA_DOWNLOAD_ACTION)).trim()
      if (token) return token
    }

    await new Promise((resolve) => setTimeout(resolve, RECAPTCHA_READY_POLL_MS))
  }

  throw new Error("reCAPTCHA is not ready. Please refresh and try again.")
}
