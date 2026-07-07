import { NextResponse } from "next/server"

import { formatProviderError } from "@/lib/provider-api"
import { enforceRateLimit } from "@/lib/security/rate-limit-api"

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(
    request,
    "download-request-otp",
    { limit: 5, windowMs: 60 * 60 * 1000 },
    "Too many OTP requests. Please try again later."
  )
  if (rateLimited) return rateLimited

  try {
    const body = (await request.json()) as {
      full_name?: string
      phone_number?: string
      recaptcha?: string
    }

    const fullName = body.full_name?.trim() ?? ""
    const phoneNumber = body.phone_number?.trim() ?? ""
    const recaptcha = body.recaptcha?.trim() ?? ""

    if (!fullName) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      )
    }

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400 }
      )
    }

    if (!recaptcha) {
      return NextResponse.json(
        { error: "Complete reCAPTCHA verification before requesting a code." },
        { status: 400 }
      )
    }

    const response = await fetch(
      "https://provider.jobmedia.com.bd/api/account/download-permit/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: "+88" + phoneNumber,
          full_name: fullName,
          user_type: "jobseeker",
          recaptcha: recaptcha,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      let error = formatProviderError(data, "Could not send verification code.")

      if (
        process.env.NODE_ENV !== "production" &&
        /recaptcha/i.test(error)
      ) {
        error +=
          " For local development, add localhost to the allowed domains for the reCAPTCHA site key in Google reCAPTCHA admin."
      }

      return NextResponse.json({ error }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("OTP request error:", error)
    return NextResponse.json(
      { error: "Could not send verification code." },
      { status: 500 }
    )
  }
}
