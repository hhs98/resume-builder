import { NextResponse } from "next/server"

import { verifyDownloadOtp } from "@/lib/download-otp-store"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      phone_number?: string
      otp?: string
    }

    const phoneNumber = body.phone_number?.trim() ?? ""
    const otp = body.otp?.trim() ?? ""

    if (!phoneNumber || otp.length !== 6) {
      return NextResponse.json(
        { error: "Enter the 6-digit code." },
        { status: 400 }
      )
    }

    const result = verifyDownloadOtp(phoneNumber, otp)

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Verification failed." },
      { status: 500 }
    )
  }
}
