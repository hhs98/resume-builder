"use client"

import { GoogleReCaptchaProvider } from "@google-recaptcha/react"

interface RecaptchaProviderProps {
  children: React.ReactNode
}

// Public site key — reCAPTCHA v3 runs entirely in the browser.
const RECAPTCHA_SITE_KEY = "6LecAygrAAAAAGs7RgEEc_zba-bIae2StRI1JWEm"

const RecaptchaProvider: React.FC<RecaptchaProviderProps> = ({ children }) => {
  return (
    <GoogleReCaptchaProvider siteKey={RECAPTCHA_SITE_KEY} type="v3">
      {children}
    </GoogleReCaptchaProvider>
  )
}

export default RecaptchaProvider
