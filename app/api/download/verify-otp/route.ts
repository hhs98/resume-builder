import { NextResponse } from "next/server"

import { createDownloadPermit } from "@/lib/security/download-permit"
import { formatProviderError } from "@/lib/provider-api"
import { enforceRateLimit } from "@/lib/security/rate-limit-api"

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(
    request,
    "download-verify-otp",
    { limit: 10, windowMs: 60 * 60 * 1000 },
    "Too many verification attempts. Please try again later."
  )
  if (rateLimited) return rateLimited

  try {
    const body = (await request.json()) as {
      full_name?: string
      phone_number?: string
      otp?: string
      recaptcha?: string
    }

    const fullName = body.full_name?.trim() ?? ""
    const phoneNumber = body.phone_number?.trim() ?? ""
    const otp = body.otp?.trim() ?? ""
    const recaptcha = body.recaptcha?.trim() ?? ""

    if (!fullName) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      )
    }

    if (!phoneNumber || otp.length !== 6) {
      return NextResponse.json(
        { error: "Enter the 6-digit code." },
        { status: 400 }
      )
    }

    if (!recaptcha) {
      return NextResponse.json(
        { error: "Complete reCAPTCHA verification before verifying the code." },
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
          otp: otp,
          recaptcha: recaptcha,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          error: formatProviderError(data, "Verification failed."),
        },
        { status: response.status }
      )
    }

    const permit = createDownloadPermit(phoneNumber, fullName)

    return NextResponse.json(
      {
        success: true,
        permit,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Verification failed." }, { status: 500 })
  }
}
