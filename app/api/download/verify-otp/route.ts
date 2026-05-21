import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      phone_number?: string
      otp?: string
      recaptcha?: string
    }

    const phoneNumber = body.phone_number?.trim() ?? ""
    const otp = body.otp?.trim() ?? ""
    const recaptcha = body.recaptcha?.trim() ?? ""

    if (!phoneNumber || otp.length !== 6) {
      return NextResponse.json(
        { error: "Enter the 6-digit code." },
        { status: 400 }
      )
    }

    const response = await fetch(
      "https://provider.jobmedia.com.bd/api/account/login/otp/verify/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: "+88" + phoneNumber,
          user_type: "jobseeker",
          recaptcha: recaptcha,
          otp: otp,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.error || "Verification failed." },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      access_token: data.access_token || data.token,
    })
  } catch {
    return NextResponse.json({ error: "Verification failed." }, { status: 500 })
  }
}
