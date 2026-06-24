"use client"

import { GoogleReCaptchaProvider } from "@google-recaptcha/react"

interface RecaptchaProviderProps {
  children: React.ReactNode
}

const RecaptchaProvider: React.FC<RecaptchaProviderProps> = ({ children }) => {
  return (
    <GoogleReCaptchaProvider
      siteKey="6LecAygrAAAAAGs7RgEEc_zba-bIae2StRI1JWEm"
      type="v3"
    >
      {children}
    </GoogleReCaptchaProvider>
  )
}

export default RecaptchaProvider
