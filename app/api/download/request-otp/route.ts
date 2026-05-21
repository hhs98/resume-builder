import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      phone_number?: string
      recaptcha?: string
    }

    const phoneNumber = body.phone_number?.trim() ?? ""
    const recaptcha = body.recaptcha?.trim() ?? ""

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400 }
      )
    }

    const response = await fetch(
      "https://provider.jobmedia.com.bd/api/account/login/otp/send/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: "+88" + phoneNumber,
          user_type: "jobseeker",
          recaptcha: recaptcha,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data.message || data.error || "Could not send verification code.",
        },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Could not send verification code." },
      { status: 500 }
    )
  }
}
