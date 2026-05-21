import { NextResponse } from "next/server"

import {
  createDownloadOtp,
  normalizePhoneNumber,
} from "@/lib/download-otp-store"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      phone_number?: string
      recaptcha?: string
    }

    const phoneNumber = body.phone_number?.trim() ?? ""
    const recaptcha = body.recaptcha?.trim() ?? ""

    if (!normalizePhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400 }
      )
    }

    const code = createDownloadOtp(phoneNumber, recaptcha)

    if (process.env.NODE_ENV === "development") {
      console.info(
        `[download-otp] ${phoneNumber}: ${code} (expires in 5 minutes)`
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
